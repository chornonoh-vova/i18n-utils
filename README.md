# i18n-utils

CLI for bulk-editing JSON translation files matched by a glob.

Three commands:

- `add` — add a key/value to every matched file (errors if the key already exists)
- `update` — replace the value at an existing key in every matched file
- `remove` — delete a key from every matched file (and prune any parents it leaves empty)

```bash
i18n-utils --help
```

## Installation

Published on GitHub Packages. Add the scope to your `.npmrc`:

```
@chornonoh-vova:registry=https://npm.pkg.github.com
```

Then install globally:

```bash
npm install --global @chornonoh-vova/i18n-utils
```

GitHub Packages requires an authenticated token even for public packages — see GitHub's docs for setting one up.

## Usage

```bash
i18n-utils add    './locales/*.json' -k 'example.title' -v 'Example Title'
i18n-utils update './locales/*.json' -k 'example.title' -v 'New Example Title'
i18n-utils remove './locales/*.json' -k 'example.title'
```

Keys use dot notation (`a.b.c`). Missing intermediate objects are created on `add`; empty parents are pruned on `remove`.

### Base language and prefix

For `add` and `update`, the value is written verbatim only into files whose filename stem exactly equals the base language (default `en`); other files receive the value with a `*EN* ` prefix so untranslated strings stay visually obvious until a translator fills them in. Override with `--base` and `--prefix`.

## Requirements

- Node.js v24+
- npm v11+

## Development

```bash
npm install            # install deps
npm run build          # tsc → dist/
npm test               # node:test on src/**/*.test.ts
npm run link           # build + npm link (exposes the bin globally)
DEBUG=* npm start      # run from source with debug logs
```

Per-command debug channels: `DEBUG=add`, `DEBUG=update`, `DEBUG=remove`.

## Releasing

```bash
npm run release
```
