const Protocol = require("./protocol");

class TextProtocol extends Protocol {
  async execute(input) {
    const [from, to] = this.config.detectLang(input);
    const name = this.config.defaults.service;
    if (!this.translator.isPageExist(name)) {
      const service = this.config.services[name];
      // TODO: service is null
      await this.translator.openPage(name, service);
    }
    const resultText = await this.translator.translate(name, input, from, to);
    await this.output(resultText);
  }
}

module.exports = TextProtocol;
