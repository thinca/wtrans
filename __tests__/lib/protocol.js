const Protocol = require("../../lib/protocol");

describe("Protocol", () => {
  let protocol;
  beforeEach(() => protocol = new Protocol());

  describe(".output()", () => {
    describe("when output function is not set", () => {
      it("do nothing", () => {
        protocol.output("message");
      });
    });
    describe("when output function is set", () => {
      it("calls output function", () => {
        const fn = jest.fn();
        protocol.setOutputFunction(fn);
        protocol.output("message");
        expect(fn).toHaveBeenCalledWith("message");
      });
    });
  });
});
