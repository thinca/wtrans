const fs = require("fs");
const YAML = require("js-yaml");

const isMultibyte = (str) => {
  for (let i = 0; i < str.length; i++) {
    if (0xff < str.codePointAt(i)) {
      return true;
    }
  }
  return false;
};

class Config {
  static load(configFiles) {
    const filename = configFiles.find((f) => f && fs.existsSync(f));
    if (filename) {
      const configObj = YAML.safeLoad(fs.readFileSync(filename), {filename});
      return new Config(configObj);
    }
  }

  constructor(config) {
    Object.assign(this, config);
    this.defaults = this.defaults || {};
    this.services = this.services || {};
  }

  overwriteByCommandline(program) {
    if (program.service) {
      this.defaults.service = program.service;
    }
    if (program.fromLang) {
      this.defaults.fromLang = program.fromLang;
    }
    if (program.toLang) {
      this.defaults.toLang = program.toLang;
    }
  }

  detectLang(sourceText, defaultFromLang, defaultToLang) {
    const from = defaultFromLang || this.detectFromLangBySourceText(sourceText);
    if (!from) {
      throw new Error("From-lang couldn't detect");
    }
    const to = defaultToLang || this.detectToLangByFromLang(from);
    if (!to) {
      throw new Error("To-lang couldn't detect");
    }
    return [from, to];
  }

  detectFromLangBySourceText(sourceText) {
    if (this.defaults.fromLang) {
      return this.defaults.fromLang;
    }
    if (this.defaults.multibyteLanguage && isMultibyte(sourceText)) {
      return this.defaults.multibyteLanguage;
    }
    return this.defaults.singlebyteLanguage;
  }

  detectToLangByFromLang(fromLang) {
    if (this.defaults.toLang) {
      return this.defaults.toLang;
    }
    return (this.defaults.toLanguageCandidates || []).find((e) => e !== fromLang);
  }
}

module.exports = Config;
