import type { TestContext } from "node:test";
import type { Arguments } from "yargs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readJsonFile, writeJsonFile } from "./shared.ts";

// chdir into the tmp dir so command globs see bare filenames as `entry`.
// Without this, an absolute path glob exposes the base/prefix substring-match
// foot-gun to random characters in the tmp path itself (e.g. a tmp dir
// containing "de" would make every file match `--base de`).
// Safe because node:test runs tests serially within a file and each file in
// its own worker process — no concurrent chdir across tests.
export async function withWorkDir<T>(
  fn: (workDir: string) => Promise<T>,
): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "i18n-utils-"));
  const originalCwd = process.cwd();
  process.chdir(dir);
  try {
    return await fn(dir);
  } finally {
    process.chdir(originalCwd);
    await rm(dir, { recursive: true, force: true });
  }
}

export async function writeLocale(
  workDir: string,
  name: string,
  content: unknown,
  indentation = 2,
): Promise<void> {
  await writeJsonFile(join(workDir, name), content, indentation);
}

export async function readLocale(
  workDir: string,
  name: string,
): Promise<unknown> {
  return readJsonFile(join(workDir, name));
}

export function silence(t: TestContext): void {
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "warn", () => {});
}

export function buildArgs<T extends Record<string, unknown>>(
  extra: T,
): Arguments<T> {
  return { _: [], $0: "i18n-utils", ...extra } as Arguments<T>;
}
