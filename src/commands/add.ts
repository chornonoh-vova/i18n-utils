import { glob } from "node:fs/promises";

import { type CommandModule } from "yargs";
import debugFn from "debug";

import {
  isBase,
  readJsonFile,
  updaterBuilder,
  writeJsonFile,
  type UpdaterArgs,
} from "./shared.ts";
import { has, set } from "../lib/obj.ts";

const debug = debugFn("add");

export const addCommand: CommandModule<{}, UpdaterArgs> = {
  command: "add <path> [options]",
  aliases: "a",
  describe: "add specified key with value to translation files",
  builder: (builder) => updaterBuilder(builder),
  handler: async (args) => {
    let count = 0;
    const keyPath = args.key.split(".");

    for await (const entry of glob(args.path)) {
      const value = isBase(entry, args.base)
        ? args.value
        : args.prefix + args.value;

      debug("reading file", entry);
      const translations = await readJsonFile(entry);

      if (has(translations, keyPath)) {
        throw new Error(
          `Key '${args.key}' already exists in the file: ${entry}`,
        );
      }

      debug(`key='${args.key}'`, `value='${value}'`, "to", `file='${entry}'`);
      set(translations, keyPath, value);

      debug("writing file", entry);
      await writeJsonFile(entry, translations, args.indentation);

      count++;
    }

    if (!count) {
      console.warn(
        "⚠️ key/value wasn't added to any files, please re-check the glob:",
        args.path,
      );
    } else {
      console.log("✅ added", args.key, "to", count, "files");
    }
  },
};
