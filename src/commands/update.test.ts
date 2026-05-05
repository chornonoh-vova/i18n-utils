import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { updateCommand } from "./update.ts";
import {
  buildArgs,
  readLocale,
  silence,
  withWorkDir,
  writeLocale,
} from "./test-utils.ts";

describe("update command", () => {
  it("replaces verbatim in base files and prefixed elsewhere", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", { greeting: "Hi" });
      await writeLocale(workDir, "de.json", { greeting: "Hallo" });

      await updateCommand.handler!(
        buildArgs({
          path: "*.json",
          key: "greeting",
          value: "Hello",
          base: "en",
          prefix: "*EN* ",
          indentation: 2,
        }),
      );

      assert.deepEqual(await readLocale(workDir, "en.json"), {
        greeting: "Hello",
      });
      assert.deepEqual(await readLocale(workDir, "de.json"), {
        greeting: "*EN* Hello",
      });
    });
  });

  it("throws if the key does not exist", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", {});

      await assert.rejects(async () => {
        await updateCommand.handler!(
          buildArgs({
            path: "*.json",
            key: "missing",
            value: "X",
            base: "en",
            prefix: "*EN* ",
            indentation: 2,
          })
        );
      },
        /does not exist/,
      );
    });
  });
});
