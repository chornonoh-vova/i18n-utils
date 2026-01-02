import { glob, readFile, writeFile } from "node:fs/promises";

import { type CommandModule } from "yargs";
import debugFn from "debug";

import { updaterBuilder, type UpdaterArgs } from "./shared.ts";
import { get, has, set } from "../lib/obj.ts";

const debug = debugFn("update");

export const updateCommand: CommandModule<{}, UpdaterArgs> = {
  command: "update <path> [options]",
  aliases: "u",
  describe: "update specified key with new value in translation files",
  builder: (builder) => updaterBuilder(builder),
  handler: async (args) => {
    let count = 0;
    const keyPath = args.key.split(".");

    for await (const entry of glob(args.path)) {
      const isBase = entry.includes(args.base);
      const value = isBase ? args.value : args.prefix + args.value;

      debug("reading file", entry);
      const translations = JSON.parse(
        await readFile(entry, { encoding: "utf-8" }),
      );

      if (!has(translations, keyPath)) {
        throw new Error(
          `Key '${args.key}' does not exist in the file: ${entry}`,
        );
      }

      debug(
        `key='${args.key}'`,
        `old value='${get(translations, keyPath)}'`,
        `new value='${value}'`,
        "to",
        `file='${entry}'`,
      );
      set(translations, keyPath, value);

      debug("writing file", entry);
      await writeFile(
        entry,
        JSON.stringify(translations, null, args.indentation),
      );

      count++;
    }

    if (!count) {
      console.warn(
        "⚠️ key/value wasn't updated in any files, please re-check the glob:",
        args.path,
      );
    } else {
      console.log("✅ updated", args.key, "in", count, "files");
    }
  },
};
