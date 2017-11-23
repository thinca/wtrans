class SequentialProcessor {
  constructor() {
    this.currentPromise = Promise.resolve();
  }

  queue(fn) {
    return this.currentPromise = this.currentPromise.then(fn);
  }
}

module.exports = SequentialProcessor;
