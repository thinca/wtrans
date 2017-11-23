const Protocol = require("./protocol");
const {JsonRpc2Implementer: JsonRpc} = require("json-rpc2-implementer");

class TranslatorProxy {
  constructor(translator, config) {
    this.translator = translator;
    this.config = config;
  }

  async openPage({pageName, service = this.config.services[pageName]}) {
    if (typeof service === "string") {
      service = this.config.services[service];
    }
    await this.translator.openPage(pageName, service);
  }

  async closePage({pageName}) {
    await this.translator.closePage(pageName);
  }

  listPageNames() {
    return this.translator.listPageNames();
  }

  async translate({sourceText, fromLang, toLang, pageName}) {
    const [from, to] = this.config.detectLang(sourceText, fromLang, toLang);
    const name = pageName || this.config.defaults.service;
    if (!this.translator.isPageExist(name)) {
      const service = this.config.services[name];
      // TODO: service is null
      await this.translator.openPage(name, service);
    }
    const resultText = await this.translator.translate(name, sourceText, from, to);
    return {
      sourceText, resultText, pageName: name, fromLang: from, toLang: to
    };
  }
}

class JSONProtocol extends Protocol {
  constructor(translator, config) {
    super();
    this.processor = new TranslatorProxy(translator, config);
    const rpc = new JsonRpc();
    rpc.sender = (message) => {
      this.output(message);
    };
    rpc.methodHandler = async (method, params) => {
      return await this.processor[method](params);
    };
    this.rpc = rpc;
  }

  async execute(input) {
    await this.rpc.receive(input);
  }
}

module.exports = JSONProtocol;
