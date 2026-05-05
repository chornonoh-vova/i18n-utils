# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CLI tool (`i18n-utils`) that mutates JSON translation files in bulk. Three commands operate on files matched by a glob: `add`, `update` (aliased `u`), `remove` (aliased `r`/`rm`). Published to GitHub Packages as `@chornonoh-vova/i18n-utils`.

Requires Node.js v24+ and npm v11+. The runtime uses Node's native TypeScript support — entry points (`src/index.ts`, `dist/index.js`) and intra-project imports use `.ts` extensions; `tsconfig.json` sets `rewriteRelativeImportExtensions` so emitted JS resolves to `.js`.

## Commands

```bash
npm run build         # tsc → dist/
npm start             # run via node directly with DEBUG=*
npm run link          # build + npm link (exposes `i18n-utils` bin globally)
npm test              # node --test on src/**/*.test.ts
npm run release       # release-it (version bump + GitHub release + publish)
```

Tests use the native `node:test` runner; `.ts` test files are executed directly thanks to Node 24+'s built-in TypeScript stripping (no flags or transpile step). To run a single file: `node --test src/lib/obj.test.ts`. There is no linter configured.

To run the CLI during development: `node ./src/index.ts <command> ...` or `DEBUG=* npm start -- <command> ...`. Each command namespaces its own debug channel (`add`, `update`, `remove`) — filter with e.g. `DEBUG=add`.

## Architecture

- **`src/index.ts`** — yargs entry point. Wires the three command modules and provides the top-level `--help` examples. Has a `#!/usr/bin/env node` shebang because `dist/index.js` is the published `bin`.
- **`src/commands/shared.ts`** — yargs builder factories (`baseBuilder`, `updaterBuilder`) and shared arg types (`BaseArgs`, `UpdaterArgs`). `add` and `update` share `updaterBuilder` (key + value + base/prefix); `remove` uses only `baseBuilder` (key, no value).
- **`src/commands/{add,update,remove}.ts`** — each exports a `CommandModule`. They share a near-identical loop: stream files via `fs/promises` `glob`, `JSON.parse`, mutate via `lib/obj.ts`, write back with configurable indentation. `add` errors if the key already exists; `update`/`remove` error if it doesn't.
- **`src/lib/obj.ts`** — pure helpers `get`/`set`/`has`/`remove` operating on dot-notation paths (already split into `string[]` by callers). `remove` additionally prunes empty parent objects up the chain. These are the canonical mutation primitives — don't reach into translation objects directly from command handlers.

### Base-language prefix convention

`add` and `update` accept `--base` (default `en`) and `--prefix` (default `*EN* `). For each matched file, if the file's stem (filename without extension) **equals** `--base` it's treated as the source-of-truth language and written as-is; otherwise the value is prefixed (so non-English files visibly carry the untranslated English string until a translator replaces it). This is intentional behavior — preserve it when modifying these commands.

## Release flow

`release-it` is configured via `.release-it.json`. The `release` GitHub workflow (`.github/workflows/release.yaml`) handles publishing — `npm run release` locally drives the version bump and tag.
