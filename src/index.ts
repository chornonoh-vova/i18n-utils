#!/usr/bin/env node

import { argv, exit } from "node:process";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { addCommand } from "./commands/add.ts";
import { updateCommand } from "./commands/update.ts";
import { removeCommand } from "./commands/remove.ts";

await yargs(hideBin(argv))
  .scriptName("i18n-utils")
  .usage("Usage: $0 <command>")
  .demandCommand(1, "Please specify a command")
  .command(addCommand)
  .example(
    "$0 add './locales/*.json' -k 'example.title' -v 'Example Title'",
    "Add given key/value to translation files matching glob",
  )
  .command(updateCommand)
  .example(
    "$0 update './locales/*.json' -k 'example.title' -v 'New Example Title'",
    "Update existing key with new value in translation files matching glob",
  )
  .command(removeCommand)
  .example(
    "$0 remove './locales/*.json' -k 'example.title'",
    "Remove existing key from translation files matching glob",
  )
  .help()
  .wrap(null)
  .fail((msg, err, yargs) => {
    if (err) {
      console.error(`❌ ${err.message}`);
    } else {
      console.error("Parsing error: " + msg);
      console.log("\n" + yargs.showHelpOnFail(false).help());
    }
    exit(1);
  }).argv;
