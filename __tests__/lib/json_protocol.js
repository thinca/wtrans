const JSONProtocol = require("../../lib/json_protocol");
const Config = require("../../lib/config");

describe("JSONProtocol", () => {
  const conf = {
    defaults: {
      fromLang: "en",
      toLang: "ja",
      service: "sample",
    },
    services: {
      sample: {
        url: "http://example.com",
      },
      other: {
        url: "http://other.com/other",
      },
    }
  };
  let protocol;
  let isPageExist = true;
  let translator;
  let output;
  let resultText;
  const listPageNames = ["sample"];

  beforeEach(() => {
    translator = {
      isPageExist: jest.fn(() => isPageExist),
      openPage: jest.fn(),
      closePage: jest.fn(),
      translate: jest.fn(() => resultText),
      listPageNames: jest.fn(() => listPageNames),
    };
    const config = new Config(conf);
    protocol = new JSONProtocol(translator, config);
    output = jest.fn();
    protocol.setOutputFunction(output);
  });

  describe("methods", () => {
    describe(".execute()", () => {
      describe("openPage method", () => {
        it("opens a new page", async () => {
          const query = {
            jsonrpc: "2.0",
            id: 1,
            method: "openPage",
            params: {
              pageName: "sample",
            },
          };
          await protocol.execute(JSON.stringify(query));
          expect(translator.openPage).toHaveBeenCalledWith("sample", conf.services.sample);
        });

        describe("when service name is provided", () => {
          it("is used", async () => {
            const query = {
              jsonrpc: "2.0",
              id: 1,
              method: "openPage",
              params: {
                pageName: "sample",
                service: "other",
              },
            };
            await protocol.execute(JSON.stringify(query));
            expect(translator.openPage).toHaveBeenCalledWith("sample", conf.services.other);
          });
        });
      });

      describe("closePage method", () => {
        it("closes a page", async () => {
          const query = {
            jsonrpc: "2.0",
            id: 1,
            method: "closePage",
            params: {
              pageName: "sample",
            },
          };
          await protocol.execute(JSON.stringify(query));
          expect(translator.closePage).toHaveBeenCalledWith("sample");
        });
      });

      describe("listPageNames method", () => {
        it("returns list of page names", async () => {
          const query = {
            jsonrpc: "2.0",
            id: 1,
            method: "listPageNames",
          };
          await protocol.execute(JSON.stringify(query));
          const expectResult = {
            jsonrpc: "2.0",
            id: 1,
            result: listPageNames,
          };
          expect(output).toHaveBeenCalledWith(JSON.stringify(expectResult));
          expect(translator.listPageNames).toHaveBeenCalled();
        });
      });

      describe("translate method", () => {
        it("translates a text", async () => {
          const query = {
            jsonrpc: "2.0",
            id: 1,
            method: "translate",
            params: {
              sourceText: "text",
              fromLang: "en",
              toLang: "ja",
              pageName: "sample",
            }
          };
          resultText = "テキスト";
          await protocol.execute(JSON.stringify(query));
          const expectResult = {
            jsonrpc: "2.0",
            id: 1,
            result: {
              sourceText: "text",
              resultText: "テキスト",
              pageName: "sample",
              fromLang: "en",
              toLang: "ja",
            },
          };
          expect(output).toHaveBeenCalledWith(JSON.stringify(expectResult));
          expect(translator.translate).toHaveBeenCalledWith("sample", "text", "en", "ja");
        });

        describe("when a page is closed", () => {
          it("opens a page", async () => {
            const query = {
              jsonrpc: "2.0",
              id: 1,
              method: "translate",
              params: {
                sourceText: "text",
                fromLang: "en",
                toLang: "ja",
                pageName: "sample",
              }
            };
            isPageExist = false;
            await protocol.execute(JSON.stringify(query));
            expect(translator.openPage).toHaveBeenCalledWith("sample", conf.services.sample);
          });
        });

        describe("when a page name is not provided", () => {
          it("uses default service", async () => {
            const query = {
              jsonrpc: "2.0",
              id: 1,
              method: "translate",
              params: {
                sourceText: "text",
                fromLang: "en",
                toLang: "ja",
              }
            };
            await protocol.execute(JSON.stringify(query));
            expect(translator.translate).toHaveBeenCalledWith("sample", "text", "en", "ja");
          });
        });
      });
    });
  });
});
