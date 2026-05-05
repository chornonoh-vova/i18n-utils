import { readFile, writeFile } from "node:fs/promises";
import { basename, extname } from "node:path";

import type { Argv } from "yargs";

export function isBase(filename: string, base: string): boolean {
  return basename(filename, extname(filename)) === base;
}

export async function readJsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, { encoding: "utf-8" }));
}

export async function writeJsonFile(
  path: string,
  value: unknown,
  indentation: number,
): Promise<void> {
  await writeFile(path, JSON.stringify(value, null, indentation) + "\n");
}

export type BaseArgs = {
  path: string;
  key: string;
  indentation: number;
};

export function baseBuilder(builder: Argv<{}>): Argv<BaseArgs> {
  return builder
    .positional("path", {
      type: "string",
      description: "path to the translation files in glob format",
      demandOption: true,
    })
    .option("key", {
      type: "string",
      alias: "k",
      description: "translation key in dot notation",
      demandOption: true,
    })
    .option("indentation", {
      type: "number",
      alias: "i",
      default: 2,
      description: "JSON indentation",
    });
}

export type UpdaterArgs = {
  value: string;
  base: string;
  prefix: string;
} & BaseArgs;

export function updaterBuilder(builder: Argv<{}>): Argv<UpdaterArgs> {
  return baseBuilder(builder)
    .option("value", {
      type: "string",
      alias: "v",
      description: "value for the translation",
      demandOption: true,
    })
    .option("base", {
      type: "string",
      alias: "b",
      default: "en",
      description: "base language",
    })
    .option("prefix", {
      type: "string",
      alias: "p",
      default: "*EN* ",
      description: "prefix for other languages",
    });
}
