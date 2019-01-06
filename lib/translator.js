// For ESLint: Some functions are evaluated on browser context
/* global window document MutationObserver XPathResult */

const util = require("util");
const puppeteer = require("puppeteer");
const SequentialProcessor = require("./sequential_processor");

const doActions = async (page, actions = []) => {
  for (const action of actions) {
    if (action.click) {
      await page.click(action.click);
    } else if (action.select) {
      await page.select(...action.select);
    } else {
      throw new Error(`Unknown action: ${util.inspect(action)}`);
    }
  }
};

const setRequestFilter = (page, filters) => {
  const acceptPattern = filters.acceptURLPattern ? new RegExp(filters.acceptURLPattern) : null;
  const ignorePattern = filters.ignoreURLPattern ? new RegExp(filters.ignoreURLPattern) : null;
  page.on("request", (req) => {
    const url = req.url();
    if (acceptPattern && !acceptPattern.test(url)) {
      req.abort();
      return;
    }
    if (ignorePattern && ignorePattern.test(url)) {
      req.abort();
      return;
    }
    req.continue();
  });
};

class Worker {
  constructor(service) {
    this.service = service;
    this.seq = new SequentialProcessor();
  }

  end() {
    this.seq = null;
  }
}

class Translator {
  static async create() {
    const instance = new Translator();
    await instance.setup();
    return instance;
  }

  async setup() {
    this.seq = new SequentialProcessor();
    this.browser = await puppeteer.launch();
    this.workers = new Map();
  }

  async openPage(pageName, service) {
    if (this.isPageExist(pageName)) {
      return;
    }
    const worker = new Worker(service);
    this.workers.set(pageName, worker);
    await worker.seq.queue(async () => {
      const page = await this.browser.newPage();
      if (service.requestFilters) {
        await page.setRequestInterception(true);
        setRequestFilter(page, service.requestFilters);
      }
      await page.goto(service.url);
      await doActions(page, service.actions.startup || []);
      worker.page = page;
      if (service.ajax) {
        const nodeSelector = service.resultContainerSelector || service.resultNodeSelector;
        await page.$eval(nodeSelector, (resultNode, service) => {
          window.isResultExist = false;
          const observer = new MutationObserver((mutations) => {
            try {
              mutations.forEach((mutation) => {
                if (mutation.addedNodes.length === 0) {
                  return;
                }
                if (service.ignoreResultXPath) {
                  const result = document.evaluate(service.ignoreResultXPath, resultNode, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null);
                  if (result.singleNodeValue) {
                    return;
                  }
                }
                window.isResultExist = true;
              });
            } catch (e) {
              // TODO
            }
          });
          observer.observe(resultNode, {childList: true, subtree: true});
        }, service);
      }
    });
  }

  async closePage(pageName) {
    if (!this.isPageExist(pageName)) {
      return;
    }
    const worker = this.workers.get(pageName);
    const {seq} = worker;
    worker.end();
    await seq.queue(async () => {
      const {page} = this.workers.get(pageName);
      this.workers.delete(pageName);
      await page.close();
    });
  }

  listPageNames() {
    return Array.from(this.workers.keys());
  }

  isPageExist(pageName) {
    return this.workers.has(pageName);
  }

  async translate(pageName, text, from, to) {
    if (!/\S/.test(text)) {
      // Specialize: Can not detect the empty result in some services.
      return text;
    }
    if (!this.isPageExist(pageName)) {
      throw new Error(`page "${pageName}" was already closed`);
    }
    const {seq} = this.workers.get(pageName);
    return seq.queue(async () => {
      const {page, service} = this.workers.get(pageName);
      const {actions} = service;
      await page.$eval(service.sourceNodeSelector, (e) => e.value = "");

      const fromToAction = actions[`from_${from}_to_${to}`];
      if (fromToAction) {
        await doActions(page, fromToAction);
      } else {
        const fromAction = actions[`from_${from}`];
        await doActions(page, fromAction);
        const toAction = actions[`to_${to}`];
        await doActions(page, toAction);
      }

      await page.type(service.sourceNodeSelector, text);

      await page.evaluate(() => {
        window.isResultExist = false;
      });

      const executeFromToAction = actions[`execute_from_${from}_to_${to}`];
      const executeAction = executeFromToAction || actions.execute;
      const actionPromise = doActions(page, executeAction);

      if (service.ajax) {
        await Promise.all([
          page.waitForFunction(() => window.isResultExist, {timeout: 5000}),
          actionPromise,
        ]);
      } else {
        await Promise.all([
          page.waitForNavigation({}),
          actionPromise,
        ]);
      }

      const result = await page.$eval(
        service.resultNodeSelector,
        (node) => node.nodeName === "TEXTAREA" ? node.value : node.innerText
      );

      return result.trim();
    });
  }

  async end() {
    const allWorkers = Array.from(this.workers.values());
    const allPromises = allWorkers.map((p) => p.seq.currentPromise);
    allWorkers.forEach((worker) => {
      worker.end();
    });
    await Promise.all(allPromises);
    await this.browser.close();
  }
}

module.exports = {Translator};
