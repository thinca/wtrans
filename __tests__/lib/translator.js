const {Translator} = require("../../lib/translator");

jest.mock("puppeteer", () => {
  const puppeteer = jest.genMockFromModule("puppeteer");

  let mockFunc;
  let expectedResult;

  class Page {
    async goto(url) {
      mockFunc({goto: [url]});
    }
    async click(selector) {
      mockFunc({click: [selector]});
    }
    async select(selector, target) {
      mockFunc({select: [selector, target]});
    }
    async $eval(selector, _func, ..._args) {
      mockFunc({$eval: [selector]});
      return expectedResult;
    }
    async evaluate(_func) {
      mockFunc({evaluate: []});
    }
    async waitForFunction(_func, options) {
      mockFunc({waitForFunction: [options]});
    }
    async waitForNavigation(options) {
      mockFunc({waitForNavigation: [options]});
    }
    async type(selector, text) {
      mockFunc({type: [selector, text]});
    }
    async close() {
      mockFunc({close: []});
    }
    setRequestInterception(enable) {
      mockFunc({setRequestInterception: [enable]});
    }
    on(event, _callback) {
      mockFunc({on: [event]});
    }
  }

  class Puppeteer {
    async newPage() {
      return new Page();
    }
    async close() {}
  }

  puppeteer.launch = async () => {
    return new Puppeteer();
  };
  puppeteer.__setExpectedResult = (text) => {
    expectedResult = text;
  };
  puppeteer.__setMock = (mock) => {
    if (jest.isMockFunction(mock)) {
      mockFunc = mock;
    }
  };

  return puppeteer;
});

const puppeteer = require("puppeteer");

describe("Translator", () => {
  describe("static functions", () => {
    describe(".create()", () => {
      it("creates new Translator", async () => {
        expect(await Translator.create()).toBeInstanceOf(Translator);
      });
    });
  });

  describe("methods", () => {
    let mock;
    let translator;
    let service;

    beforeEach(async () => {
      mock = jest.fn();
      puppeteer.__setMock(mock);
      translator = await Translator.create();
      service = {
        url: "https://translate.example.com/",
        ajax: true,
        sourceNodeSelector: "#source",
        resultNodeSelector: "#result",
        actions: {
          execute: [{click: "#execute"}],
          from_en: [{click: "#from_en"}],
          from_ja: [{click: "#from_ja"}],
          to_en: [{click: "#to_en"}],
          to_ja: [{click: "#to_ja"}],
        },
      };
    });
    afterEach(async () => {
      await translator.end();
    });

    describe(".openPage()", () => {
      it("opens a new page", async () => {
        await translator.openPage("example", service);

        expect(translator.isPageExist("example")).toBe(true);
        expect(mock.mock.calls).toHaveLength(2);
        expect(mock).toBeCalledWith({goto: [service.url]});
        expect(mock).toBeCalledWith({$eval: [service.resultNodeSelector]});
      });

      describe("when a page is already opened", () => {
        it("does nothing", async () => {
          await translator.openPage("example", service);
          expect(mock.mock.calls).toHaveLength(2);
          await translator.openPage("example", service);
          expect(mock.mock.calls).toHaveLength(2);
        });
      });

      describe("when config includes startup action", () => {
        it("is called", async () => {
          service.actions.startup = [{click: "#start"}];
          await translator.openPage("example", service);

          expect(mock).toBeCalledWith({click: ["#start"]});
        });
      });

      describe("when config includes requestFilters", () => {
        it("sets request filters", async () => {
          service.requestFilters = {
            acceptURLPattern: "example\\.com",
            ignoreURLPattern: "\\.png$",
          };
          await translator.openPage("example", service);

          expect(mock).toBeCalledWith({setRequestInterception: [true]});
          expect(mock).toBeCalledWith({on: ["request"]});
        });
      });
    });

    describe(".closePage()", () => {
      describe("when a target tab does not exist", () => {
        it("does nothing", async () => {
          await translator.closePage("example");
          expect(mock).not.toBeCalledWith({close: []});
        });
      });
      describe("when a target tab exists", () => {
        it("closes a page", async () => {
          await translator.openPage("example", service);
          await translator.closePage("example");
          expect(mock).toBeCalledWith({close: []});
        });
      });
    });

    describe(".listPageNames()", () => {
      it("returns an array of page names", async () => {
        expect(translator.listPageNames()).toEqual([]);
        await translator.openPage("example", service);
        expect(translator.listPageNames()).toEqual(["example"]);
      });
    });

    describe(".translate()", () => {
      const expectedResult = "サンプルテキスト";
      beforeEach(() => {
        puppeteer.__setExpectedResult(expectedResult);
      });

      it("translates the text", async () => {
          await translator.openPage("example", service);
        const result = await translator.translate("example", "sample text", "en", "ja");
        expect(result).toBe(expectedResult);
        expect(mock).toBeCalledWith({click: ["#from_en"]});
        expect(mock).toBeCalledWith({click: ["#to_ja"]});
        expect(mock).toBeCalledWith({waitForFunction: [{timeout: 5000}]});
      });

      describe("with from_${from}_to_${to} action", () => {
        beforeEach(() => {
          service.actions.from_en_to_ja = [{click: "#from_en_to_ja"}];
        });
        it("calls from_${from}_to_${to}", async () => {
          await translator.openPage("example", service);
          await translator.translate("example", "sample text", "en", "ja");
          expect(mock).toBeCalledWith({click: ["#from_en_to_ja"]});
          expect(mock).not.toBeCalledWith({click: ["#from_en"]});
          expect(mock).not.toBeCalledWith({click: ["#to_ja"]});
        });
      });

      describe("with select action", () => {
        beforeEach(() => {
          service.actions.from_en = [{select: ["#from", "en"]}];
          service.actions.to_ja = [{select: ["#to", "ja"]}];
        });
        it("calls page.select", async () => {
          await translator.openPage("example", service);
          await translator.translate("example", "sample text", "en", "ja");
          expect(mock).toBeCalledWith({select: ["#from", "en"]});
          expect(mock).toBeCalledWith({select: ["#to", "ja"]});
        });
      });

      describe("with ajax=false", () => {
        beforeEach(() => {
          service.ajax = false;
        });
        it("waits for navigation", async () => {
          await translator.openPage("example", service);
          await translator.translate("example", "sample text", "en", "ja");
          expect(mock).toBeCalledWith({waitForNavigation: [{}]});
        });
      });

      describe("with empty string", () => {
        it("returns input text as result", async () => {
          const input = " ";
          const result = await translator.translate("example", input, "en", "ja");
          expect(result).toBe(input);
        });
      });

      describe("when the page does not opened", () => {
        it("throws an Error", async () => {
          expect.assertions(1);
          const input = "sample text";
          expect(translator.translate("example", input, "en", "ja")).rejects.toBeInstanceOf(Error);
        });
      });
    });
  });
});
