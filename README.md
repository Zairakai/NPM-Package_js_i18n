# @zairakai/js-i18n

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![npm][npm-badge]][npm-link]
[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![License][license-badge]][license]

[![Node.js][node-badge]][node]
[![ESLint][eslint-badge]][eslint]
[![Prettier][prettier-badge]][prettier]

Lightweight internationalization library with Laravel-style translation, pluralization, dot-notation keys, and multi-locale support.

---

## Features

- **Laravel-style `__()`** — familiar `:attribute` replacement and `{0} | {1} | [2,*] :count` pluralization
- **Dot notation keys** — navigate nested translation objects with `auth.login.title`
- **Multi-locale** — manage any number of locales, switch at runtime
- **Runtime validation** — translation data validated at runtime, invalid structures throw with a descriptive error message
- **Type-safe** — full TypeScript types for IDE support and static analysis

---

## Install

```bash
npm install @zairakai/js-i18n
```

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

### Pluralization

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

### Count + replacements (case 3)

```typescript
i18n.__('files', 3, { extra: 'info' }) // "3 files"
```

### Managing locales at runtime

```typescript
i18n.setLocale('fr')
i18n.getLocale()              // "fr"
i18n.getAvailableLocales()    // ["en", "fr"]

i18n.setTranslations('de', { welcome: 'Willkommen, :name!' })
i18n.addTranslations('de', { auth: { login: 'Anmelden' } })

i18n.hasTranslation('auth.login', 'de') // true
i18n.hasTranslation('auth.logout', 'de') // false
```

### Error handling

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

---

## Pluralization syntax

The pluralization format follows Laravel's `trans_choice` pattern exactly.

| Pattern         | Matches                      | Example                              |
| --------------- | ---------------------------- | ------------------------------------ |
| `{0}`           | Exactly 0                    | `{0} No items`                       |
| `{1}`           | Exactly 1                    | `{1} One item`                       |
| `{n}`           | Exactly n                    | `{5} Exactly five`                   |
| `[2,*]`         | 2 and above                  | `[2,*] :count items`                 |
| `[0,1]`         | 0 or 1                       | `[0,1] :count file`                  |
| `[1,10]`        | Between 1 and 10 (inclusive) | `[1,10] a few items`                 |

Forms are separated by `|`. The `:count` placeholder is automatically replaced by the count value.

```typescript
// Full example
'{0} No apples|{1} One apple|[2,*] :count apples'
```

---

## API Reference

### Factory functions

| Function | Description |
| --- | --- |
| `createI18n(translations?, locale?)` | Creates a translator instance (alias, preferred). |
| `createTranslator(translations?, locale?)` | Creates a translator instance (explicit name). |

Both return a `Translator` instance. Default locale is `'en'`.

### Translator methods

| Method                                  | Description                                             |
| --------------------------------------- | ------------------------------------------------------- |
| `__(path, replacements?)`               | Translate a key with optional replacements.             |
| `__(path, count, replacements?)`        | Translate with pluralization count.                     |
| `translate(path, replacements?)`        | Alias for `__`.                                         |
| `translate(path, count, replacements?)` | Alias for `__` with count.                              |
| `setLocale(locale)`                     | Set the active locale.                                  |
| `getLocale()`                           | Get the active locale.                                  |
| `setTranslations(locale, translations)` | Replace all translations for a locale.                  |
| `addTranslations(locale, translations)` | Merge translations into an existing locale.             |
| `hasTranslation(path, locale?)`         | Check if a translation key exists (uses active locale). |
| `getAvailableLocales()`                 | Return all registered locale codes.                     |

### Pluralization utilities

| Function                           | Description                                     |
| ---------------------------------- | ----------------------------------------------- |
| `applyPluralization(value, count)` | Apply pluralization to a raw string with count. |
| `selectPluralForm(forms, count)`   | Select the correct form from a pre-split array. |

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
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fnpm-packages%2Fi18n?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/npm-packages/js-i18n/-/issues
[node-badge]: https://img.shields.io/badge/node.js-%3E%3D22-green.svg?logo=node.js
[node]: https://nodejs.org
[eslint-badge]: https://img.shields.io/badge/code%20style-eslint-4B32C3.svg?logo=eslint
[eslint]: https://eslint.org
[prettier-badge]: https://img.shields.io/badge/formatter-prettier-F7B93E.svg?logo=prettier
[prettier]: https://prettier.io
[ecosystem]: https://gitlab.com/zairakai
