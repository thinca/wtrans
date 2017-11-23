const SequentialProcessor = require("../../lib/sequential_processor");

describe("SequentialProcessor", () => {
  let sp;

  beforeEach(() => {
    sp = new SequentialProcessor();
  });

  describe(".queue()", () => {
    it("executes promises sequentially", async () => {
      const result = [];
      sp.queue(() => result.push(1));
      sp.queue(() => result.push(2));
      sp.queue(() => result.push(3));
      sp.queue(() => result.push(4));
      await sp.queue(() => result.push(5));
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
