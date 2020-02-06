const {EOL} = require("os");
const path = require("path");
const envPaths = require("env-paths");
const {Command} = require("commander");
const readAll = require("read-all-stream");

const Config = require("./config");
const {Translator} = require("./translator");


module.exports = async ({argv, stdin, stdout, stderr, env}) => {
  const fatal = (message) => {
    stderr.write(`ERROR: ${message}${EOL}`);
  };
  const output = (message) => {
    stdout.write(message + EOL);
  };

  const program = new Command();
  program
    .arguments("<text>")
    .option("-f, --from-lang <from>", "Source text language")
    .option("-t, --to-lang <to>", "Result text language")
    .option("-c, --config <file>", "Load config file")
    .option("-s, --service <name>", "Service name")
    .option("-i, --interactive", "Enable interactive mode")
    .option("--protocol <protocol>", "Mode of IO data [text|json]", "text")
    .option("--list-services", "Show the service lists")
    .parse(argv);

  const configFiles =
    program.config
      ? [program.config]
      : [
          env.WTRANS_CONFIG,
          path.join(envPaths("wtrans", {suffix: ""}).config, "wtrans.yaml"),
          path.join(env.HOME || env.USERPROFILE || "", ".wtrans.yaml"),
        ];

  const config = Config.load(configFiles);
  if (!config) {
    fatal("Config file is not found.");
    return 1;
  }
  config.overwriteByCommandline(program);

  if (program.listServices) {
    Object.keys(config.services).forEach(output);
    return 0;
  }

  const Protocol = (() => {
    try {
      return require(`./${program.protocol}_protocol`);
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        fatal(`Unknown protocol: ${program.protocol}`);
        return;
      }
      throw e;
    }
  })();
  if (!Protocol) {
    return 1;
  }

  const puppeteerOptions = config.puppeteerOptions || {};

  const translator = await Translator.create(puppeteerOptions);
  process.on("SIGTERM", async () => {
    await translator.end();
    process.exit(0);
  });
  const protocol = new Protocol(translator, config);

  if (program.interactive) {
    const readline = require("readline");
    protocol.setOutputFunction(output);

    const options = {
      input: stdin,
    };
    if (stdin.isTTY && stdout.isTTY) {
      options.output = stdout;
    }
    await new Promise((resolve) => {
      const rl = readline.createInterface(options);
      rl.on("close", async () => {
        await translator.end();
        resolve();
      });
      rl.on("line", async (line) => {
        await protocol.execute(line);
        rl.prompt();
      });
      rl.prompt();
    });
  } else {
    protocol.setOutputFunction(output);
    const input = program.args.length === 0 ? await readAll(stdin) : program.args.join(" ");
    await protocol.execute(input);
    await translator.end();
  }
  return 0;
};
