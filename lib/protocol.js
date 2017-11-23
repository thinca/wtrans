class Protocol {
  constructor(translator, config) {
    this.translator = translator;
    this.config = config;
  }

  async output(message) {
    if (this.outputFunction) {
      await this.outputFunction(message);
    }
  }

  setOutputFunction(func) {
    this.outputFunction = func;
  }
}

module.exports = Protocol;
