const TextProtocol = require("../../lib/text_protocol");
const Config = require("../../lib/config");

describe("TextProtocol", () => {
  let protocol;
  let isPageExist = true;
  let translator;

  beforeEach(() => {
    translator = {
      isPageExist: jest.fn(() => isPageExist),
      openPage: jest.fn(),
      translate: jest.fn(),
    };
    const config = new Config({defaults: {fromLang: "en", toLang: "ja"}});
    protocol = new TextProtocol(translator, config);
  });

  describe("methods", () => {
    describe(".execute()", () => {
      it("executes translation", async () => {
        await protocol.execute("text");
        expect(translator.openPage).not.toHaveBeenCalled();
        expect(translator.translate).toHaveBeenCalled();
      });

      describe("when the target page is not opened", () => {
        beforeEach(() => isPageExist = false);
        it("opens the page", async () => {
          await protocol.execute("text");
          expect(translator.openPage).toHaveBeenCalled();
        });
      });
    });
  });
});
