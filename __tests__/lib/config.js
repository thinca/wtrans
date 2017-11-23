const path = require("path");
const configFileName = path.join(__dirname, "example.yaml");

const Config = require("../../lib/config");

describe("Config", () => {
  describe("static functions", () => {
    describe(".load()", () => {
      it("loads a config from files", () => {
        const files = [configFileName];
        const config = Config.load(files);
        expect(config).toMatchObject({
          defaults: {
            service: "example",
            singlebyteLanguage: "en",
            multibyteLanguage: "ja",
            toLanguageCandidates: ["en", "ja"],
          },
          services: {
            example: {
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
              }
            }
          }
        });
      });
      describe("when readable files is not found", () => {
        it("returns undefined", () => {
          const files = ["config.yaml"];
          expect(Config.load(files)).toBeUndefined();
        });
      });
    });
  });

  describe("methods", () => {
    let config;
    beforeEach(() => {
      config = Config.load([configFileName]);
    });

    describe(".overwriteByCommandline()", () => {
      it("overwrites default values by command-line value", () => {
        config.overwriteByCommandline({
          service: "myService",
          fromLang: "en",
          toLang: "ja",
        });
        expect(config).toMatchObject({
          defaults: {
            service: "myService",
            fromLang: "en",
            toLang: "ja",
          }
        });
      });
    });

    describe(".detectLang()", () => {
      describe("when the source is singlebyte language", () => {
        it("detects source and result language", () => {
          expect(config.detectLang("hello")).toEqual(["en", "ja"]);
        });
      });
      describe("when the source is multibyte language", () => {
        it("detects source and result language", () => {
          expect(config.detectLang("こんにちは")).toEqual(["ja", "en"]);
        });
      });
      describe("when the fromLang is specified by command-line", () => {
        beforeEach(() => config.overwriteByCommandline({fromLang: "fr"}));
        it("is used", () => {
          expect(config.detectLang("hello")).toEqual(["fr", "en"]);
        });
      });
      describe("when the toLang is specified by command-line", () => {
        beforeEach(() => config.overwriteByCommandline({toLang: "ko"}));
        it("is used", () => {
          expect(config.detectLang("hello")).toEqual(["en", "ko"]);
        });
      });
      describe("when the fromLang can not detect", () => {
        beforeEach(() => config = new Config({}));
        it("throws an Error", () => {
          expect(() => config.detectLang("hello")).toThrowError(/From-lang couldn't detect/);
        });
      });
      describe("when the toLang can not detect", () => {
        beforeEach(() => config = new Config({}));
        it("throws an Error", () => {
          expect(() => config.detectLang("hello", "en")).toThrowError(/To-lang couldn't detect/);
        });
      });
    });
  });
});
