import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { removeCommand } from "./remove.ts";
import {
  buildArgs,
  readLocale,
  silence,
  withWorkDir,
  writeLocale,
} from "./test-utils.ts";

describe("remove command", () => {
  it("removes a leaf key from every matched file", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", {
        greeting: "Hi",
        farewell: "Bye",
      });
      await writeLocale(workDir, "de.json", {
        greeting: "Hallo",
        farewell: "Tschüss",
      });

      await removeCommand.handler!(
        buildArgs({
          path: "*.json",
          key: "greeting",
          indentation: 2,
        }),
      );

      assert.deepEqual(await readLocale(workDir, "en.json"), {
        farewell: "Bye",
      });
      assert.deepEqual(await readLocale(workDir, "de.json"), {
        farewell: "Tschüss",
      });
    });
  });

  it("prunes empty parent objects", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", {
        page: { title: "Home" },
        root: 1,
      });

      await removeCommand.handler!(
        buildArgs({
          path: "*.json",
          key: "page.title",
          indentation: 2,
        }),
      );

      assert.deepEqual(await readLocale(workDir, "en.json"), { root: 1 });
    });
  });

  it("throws if the key does not exist", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", {});

      await assert.rejects(async () => {
        await removeCommand.handler!(
          buildArgs({
            path: "*.json",
            key: "missing",
            indentation: 2,
          }),
        );
      }, /does not exist/);
    });
  });
});
