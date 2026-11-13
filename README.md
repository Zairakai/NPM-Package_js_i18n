<p align="center">
  <img src="https://gitlab.com/zairakai/npm-packages/js-i18n/-/raw/main/assets/icon.png" alt="JS i18n" width="160">
</p>

# JS i18n

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![npm][npm-badge]][npm-link]
[![Docs][docs-badge]][docs]
[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![License][license-badge]][license]

[![Node.js][node-badge]][node]
[![ESLint][eslint-badge]][eslint]
[![Prettier][prettier-badge]][prettier]
[![Vitest][vitest-badge]][vitest]
[![Knip][knip-badge]][knip]

Internationalization library for the web with Laravel-style translation, pluralization, dot-notation keys and multi-locale support. Translations are validated at runtime with `zod`.

**Documentation: [js-i18n-8f9736.gitlab.io][docs]**

---

## Features

- **Laravel-style `__()`** - familiar `:attribute` replacement and `{0} | {1} | [2,*] :count` pluralization
- **Dot notation keys** - navigate nested translation objects with `auth.login.title`
- **Multi-locale** - manage any number of locales, switch at runtime
- **Runtime validation** - translation data validated at runtime, invalid structures throw with a descriptive error message
- **Type-safe** - full TypeScript types for IDE support and static analysis

---

## Documentation

The documentation site has this guide and the reference of the API generated from the source with TypeDoc, for every released version (selector at the top right, `next` is `main`). Build it with `cd docs && npm ci && npm run dev`. It is published with GitLab Pages from `main`.

---

## Install

```bash
npm install @zairakai/js-i18n
```

### In the browser

The library is made for the web: ESM and CommonJS builds, no Node.js built-ins, `"sideEffects": false`. A bundler keeps only what you import (the tests of this repository check it with esbuild): a project that imports `applyPluralization` alone gets a few hundred bytes. `createTranslator` validates the translations with `zod`, so it brings `zod` with it.

There is no minimum browser version.

---

## Usage

### Basic translation

```typescript
import { createI18n } from '@zairakai/js-i18n'

const i18n = createI18n(
  {
    en: {
      welcome: 'Welcome, :name!',
      auth: {
        login: 'Sign in',
        logout: 'Sign out',
      },
    },
    fr: {
      welcome: 'Bienvenue, :name !',
      auth: {
        login: 'Se connecter',
        logout: 'Se déconnecter',
      },
    },
  },
  'en'
)

i18n.__('welcome', { name: 'Stan' }) // "Welcome, Stan!"
i18n.__('auth.login')               // "Sign in"
```

<details>
<summary>Pluralization: singular, plural and ranges</summary>

```typescript
import { createI18n } from '@zairakai/js-i18n'

const i18n = createI18n({
  en: {
    apples: '{0} No apples|{1} One apple|[2,*] :count apples',
    files: '[0,1] :count file|[2,*] :count files',
  },
})

i18n.__('apples', 0) // "No apples"
i18n.__('apples', 1) // "One apple"
i18n.__('apples', 5) // "5 apples"
```

</details>

<details>
<summary>Count and replacements together</summary>

```typescript
i18n.__('files', 3, { extra: 'info' }) // "3 files"
```

</details>

<details>
<summary>Managing locales at runtime</summary>

```typescript
i18n.setLocale('fr')
i18n.getLocale()              // "fr"
i18n.getAvailableLocales()    // ["en", "fr"]

i18n.setTranslations('de', { welcome: 'Willkommen, :name!' })
i18n.addTranslations('de', { auth: { login: 'Anmelden' } })

i18n.hasTranslation('auth.login', 'de') // true
i18n.hasTranslation('auth.logout', 'de') // false
```

</details>

<details>
<summary>Error handling: what throws and when</summary>

Translation data is validated at runtime. Invalid structures (e.g. loading from an API or external JSON) throw an `Error` with a descriptive message indicating exactly what is wrong.

```typescript
import { createI18n } from '@zairakai/js-i18n'

try {
  const data = await fetchTranslations() // unknown external data
  const i18n = createI18n(data, 'en')
} catch (e) {
  // e.message describes the invalid field and its path
  console.error('Invalid translation data:', (e as Error).message)
}
```

The same applies to `setTranslations()`, `addTranslations()`, and `translate()` when replacements are malformed.

</details>

<details>
<summary>Pluralization syntax: the forms a translation can take</summary>

The pluralization format follows Laravel's `trans_choice` pattern exactly.

| Pattern | Matches | Example |
| :--- | :--- | :--- |
| `{0}` | Exactly 0 | `{0} No items` |
| `{1}` | Exactly 1 | `{1} One item` |
| `{n}` | Exactly n | `{5} Exactly five` |
| `[2,*]` | 2 and above | `[2,*] :count items` |
| `[0,1]` | 0 or 1 | `[0,1] :count file` |
| `[1,10]` | Between 1 and 10 (inclusive) | `[1,10] a few items` |

Forms are separated by `|`. The `:count` placeholder is automatically replaced by the count value.

```typescript
// Full example
'{0} No apples|{1} One apple|[2,*] :count apples'
```

</details>

---

## Development

```bash
npm install          # install dependencies
make quality         # full quality gate (lint, format, typecheck, tests)
make test            # run vitest
make test-coverage   # run vitest with coverage
make ci              # run CI validation locally
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full development workflow.

---

## Getting Help

[![License][license-badge]][license]
[![Security Policy][security-badge]][security]
[![Issues][issues-badge]][issues]

**Made with ❤️ by [Zairakai][ecosystem]**

<!-- Reference Links -->

## Statistics

![Statistics of js-i18n][stats-card]

[pipeline-main-badge]: https://gitlab.com/zairakai/npm-packages/js-i18n/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/npm-packages/js-i18n/-/commits/main
[pipeline-develop-badge]: https://gitlab.com/zairakai/npm-packages/js-i18n/badges/develop/pipeline.svg?ignore_skipped=true&key_text=Develop
[pipeline-develop-link]: https://gitlab.com/zairakai/npm-packages/js-i18n/-/commits/develop
[npm-badge]: https://img.shields.io/npm/v/@zairakai/js-i18n
[npm-link]: https://www.npmjs.com/package/@zairakai/js-i18n
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/npm-packages/js-i18n?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/npm-packages/js-i18n/-/releases
[coverage-badge]: https://gitlab.com/zairakai/npm-packages/js-i18n/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/npm-packages/js-i18n/-/pipelines?ref=main
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fnpm-packages%2Fjs-i18n?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/npm-packages/js-i18n/-/issues
[node-badge]: https://img.shields.io/badge/node.js-%3E%3D24-green.svg?logo=node.js
[node]: https://nodejs.org
[eslint-badge]: https://img.shields.io/badge/code%20style-eslint-4B32C3.svg?logo=eslint
[eslint]: https://eslint.org
[prettier-badge]: https://img.shields.io/badge/formatter-prettier-F7B93E.svg?logo=prettier
[prettier]: https://prettier.io
[vitest-badge]: https://img.shields.io/badge/test-vitest-6E9F18.svg?logo=vitest
[vitest]: https://vitest.dev
[knip-badge]: https://img.shields.io/badge/dead%20code-knip-EC4899.svg
[knip]: https://knip.dev
[ecosystem]: https://gitlab.com/zairakai
[docs]: https://js-i18n-8f9736.gitlab.io
[docs-badge]: https://img.shields.io/badge/docs-online-blue
[stats-card]: https://gitlab.com/zairakai/gitlab-profile/-/raw/main/assets/projects/js-i18n.svg
