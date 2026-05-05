import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { addCommand } from "./add.ts";
import {
  buildArgs,
  readLocale,
  silence,
  withWorkDir,
  writeLocale,
} from "./test-utils.ts";

describe("add command", () => {
  it("writes the value verbatim into base-language files", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", {});
      await writeLocale(workDir, "de.json", {});

      await addCommand.handler!(
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

  it("creates intermediate keys via dot notation", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", {});

      await addCommand.handler!(
        buildArgs({
          path: "*.json",
          key: "page.title",
          value: "Welcome",
          base: "en",
          prefix: "*EN* ",
          indentation: 2,
        }),
      );

      assert.deepEqual(await readLocale(workDir, "en.json"), {
        page: { title: "Welcome" },
      });
    });
  });

  it("throws if the key already exists", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "en.json", { greeting: "Hi" });

      await assert.rejects(async () => {
        await addCommand.handler!(
          buildArgs({
            path: "*.json",
            key: "greeting",
            value: "Hello",
            base: "en",
            prefix: "*EN* ",
            indentation: 2,
          }),
        );
      },
        /already exists/,
      );
    });
  });

  it("respects a custom --base when picking the verbatim file", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "de.json", {});
      await writeLocale(workDir, "en.json", {});

      await addCommand.handler!(
        buildArgs({
          path: "*.json",
          key: "greeting",
          value: "Hallo",
          base: "de",
          prefix: "*DE* ",
          indentation: 2,
        }),
      );

      assert.deepEqual(await readLocale(workDir, "de.json"), {
        greeting: "Hallo",
      });
      assert.deepEqual(await readLocale(workDir, "en.json"), {
        greeting: "*DE* Hallo",
      });
    });
  });

  it("does not treat files whose stem contains the base string as base", async (t) => {
    silence(t);
    await withWorkDir(async (workDir) => {
      await writeLocale(workDir, "denmark.json", {});
      await writeLocale(workDir, "en.json", {});

      await addCommand.handler!(
        buildArgs({
          path: "*.json",
          key: "greeting",
          value: "Hello",
          base: "en",
          prefix: "*EN* ",
          indentation: 2,
        }),
      );

      assert.deepEqual(await readLocale(workDir, "denmark.json"), {
        greeting: "*EN* Hello",
      });
      assert.deepEqual(await readLocale(workDir, "en.json"), {
        greeting: "Hello",
      });
    });
  });

  it("warns when the glob matches no files", async (t) => {
    let warned = "";
    t.mock.method(console, "log", () => { });
    t.mock.method(console, "warn", (...parts: unknown[]) => {
      warned = parts.join(" ");
    });

    await withWorkDir(async () => {
      await addCommand.handler!(
        buildArgs({
          path: "missing-*.json",
          key: "greeting",
          value: "Hi",
          base: "en",
          prefix: "*EN* ",
          indentation: 2,
        }),
      );
    });

    assert.match(warned, /wasn't added to any files/);
  });
});
