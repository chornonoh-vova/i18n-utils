import { glob } from "node:fs/promises";

import { type CommandModule } from "yargs";
import debugFn from "debug";

import {
  baseBuilder,
  readJsonFile,
  writeJsonFile,
  type BaseArgs,
} from "./shared.ts";
import { get, has, remove } from "../lib/obj.ts";

const debug = debugFn("remove");

export const removeCommand: CommandModule<{}, BaseArgs> = {
  command: "remove <path> [options]",
  aliases: ["r", "rm"],
  describe: "remove the specified key from translation files",
  builder: (builder) => baseBuilder(builder),
  handler: async (args) => {
    let count = 0;
    const keyPath = args.key.split(".");

    for await (const entry of glob(args.path)) {
      debug("reading file", entry);
      const translations = await readJsonFile(entry);

      if (!has(translations, keyPath)) {
        throw new Error(
          `Key '${args.key}' does not exist in the file: ${entry}`,
        );
      }

      debug(
        `key='${args.key}'`,
        `value='${get(translations, keyPath)}'`,
        "from",
        `file='${entry}'`,
      );
      remove(translations, keyPath);

      debug("writing file", entry);
      await writeJsonFile(entry, translations, args.indentation);

      count++;
    }

    if (!count) {
      console.warn(
        "⚠️ key wasn't removed from any files, please re-check the glob:",
        args.path,
      );
    } else {
      console.log("✅ removed", args.key, "from", count, "files");
    }
  },
};
