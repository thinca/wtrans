jest.mock("env-paths", () => {
  return () => ({config: "."});
});
jest.mock("../../lib/translator", () => {
  class Translator {
    static async create() {
      return new Translator();
    }

    constructor() {
      this.end = jest.fn();
    }
  }
  return {Translator};
});

const path = require("path");
const configFileName = path.join(__dirname, "example.yaml");
const stream = require("stream");
const command = require("../../lib/command");
const Config = require("../../lib/config");

describe("command", () => {
  const writeToStdin = (text) => {
    return new Promise((resolve, _reject) => {
      stdin.write(text, null, resolve);
    });
  };
  let argv, stdin, stdout, stderr, env, cmd_arg;
  let stdoutWrite, stderrWrite;
  beforeEach(() => {
    argv = ["node", "wtrans", "--config", configFileName];
    stdin = new stream.Transform({
      transform: jest.fn((chunk, encoding, callback) => {
        callback(null, chunk);
      }),
    });
    stdoutWrite = jest.fn();
    stderrWrite = jest.fn();
    stdout = new stream.Writable({
      write: (buffer, _encoding, callback) => {
        stdoutWrite(buffer.toString());
        callback();
      },
    });
    stderr = new stream.Writable({
      write: (buffer) => {
        stderrWrite(buffer.toString());
      },
    });
    env = {};

    cmd_arg = {argv, stdin, stdout, stderr, env};
    jest.mock("../../lib/text_protocol", () => {
      const Protocol = require("../../lib/protocol");
      class StubProtocol extends Protocol {
        execute(input) {
          this.output(input);
        }
      }
      return StubProtocol;
    });
  });

  describe("when there is no config file", () => {
    beforeEach(() => {
      cmd_arg.argv = ["node", "wtrans"];
    });
    it("prints error to stderr and exit", async () => {
      const exitCode = await command(cmd_arg);
      expect(exitCode).not.toEqual(0);
      expect(stdoutWrite).not.toBeCalled();
      expect(stderrWrite).toBeCalled();
    });

    describe("configFiles", () => {
      let load;
      beforeEach(() => {
        load = jest.spyOn(Config, "load");
      });
      afterEach(() => {
        load.mockRestore();
      });

      describe("when there is $WTRANS_CONFIG", () => {
        beforeEach(() => {
          env.WTRANS_CONFIG = "./wtrans.yaml";
        });
        it("contains it at first", async () => {
          await command(cmd_arg);
          expect(load).toBeCalledWith(["./wtrans.yaml", expect.anything(), expect.anything()]);
        });
      });
    });
  });

  describe("with --list-services option", () => {
    beforeEach(() => {
      argv.push("--list-services");
    });
    it("shows all services", async () => {
      const exitCode = await command(cmd_arg);
      expect(exitCode).toEqual(0);
      expect(stdoutWrite).toBeCalledWith("example\n");
      expect(stderrWrite).not.toBeCalled();
    });
  });

  describe("with --protocol unknown", () => {
    beforeEach(() => {
      argv.push("--protocol", "unknown");
    });
    it("prints error to stderr and exit", async () => {
      const exitCode = await command(cmd_arg);
      expect(exitCode).not.toEqual(0);
      expect(stdoutWrite).not.toBeCalled();
      expect(stderrWrite).toBeCalledWith("ERROR: Unknown protocol: unknown\n");
    });
  });

  describe("when require() failed", () => {
    beforeEach(() => {
      jest.mock("../../lib/text_protocol", () => {
        throw new Error("fail");
      });
    });
    it("throws an error", async () => {
      expect(command(cmd_arg)).rejects.toBeInstanceOf(Error);
    });
  });

  describe("with text argument", () => {
    beforeEach(() => {
      argv.push("Hello, world!");
    });
    it("reads text from argument", async () => {
      const exitCode = await command(cmd_arg);
      expect(exitCode).toEqual(0);
      expect(stdoutWrite).toBeCalledWith("Hello, world!\n");
    });
  });

  describe("without text argument", () => {
    beforeEach(async () => {
      await writeToStdin("Hello, world!");
      stdin.end();
    });
    it("reads text from stdin", async () => {
      const exitCode = await command(cmd_arg);
      expect(exitCode).toEqual(0);
      expect(stdoutWrite).toBeCalledWith("Hello, world!\n");
    });
  });

  describe("with --interactive", () => {
    beforeEach(() => {
      argv.push("--interactive");
    });
    it("reads text from stdin line by line", async () => {
      const processing = command(cmd_arg);
      await writeToStdin("hello\n");
      expect(stdoutWrite).toBeCalledWith("hello\n");
      stdoutWrite.mockClear();
      await writeToStdin("world\n");
      expect(stdoutWrite).toBeCalledWith("world\n");
      stdin.end();
      const exitCode = await processing;
      expect(exitCode).toEqual(0);
    });

    describe("when stdio is TTY", () => {
      beforeEach(() => {
        stdin.isTTY = true;
        stdout.isTTY = true;
      });
      it("outputs prompt", async () => {
        stdin.end();
        const exitCode = await command(cmd_arg);
        expect(exitCode).toEqual(0);
        expect(stdoutWrite).toBeCalledWith("> ");
      });
    });
  });
});
