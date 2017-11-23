#!/usr/bin/env node

const util = require("util");

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`${util.inspect(reason)}\n`);
  process.exit(1);
});

const command = require("../lib/command");

(async () => {
  process.exit((await command(process)) || 0);
})();
