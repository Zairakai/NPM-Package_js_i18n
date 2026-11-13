# Contributing

> This project follows the [Zairakai Global Contributing Guide][handbook-contributing].  
> Please read it before contributing. The sections below document project-specific workflow.

---

## Development Workflow

| Step | Command / Action | Description |
| :--- | :--- | :--- |
| **1. Install** | `npm install` | Install dependencies and set up git hooks. |
| **2. Branch** | `git checkout -b feature/#TICKET-name` | Create a feature branch from `develop`. |
| **3. Code** | *(your IDE)* | Implement your changes following quality standards. |
| **4. Quality** | `make quality` | Run the full quality gate. |
| **5. Test** | `make test` | Ensure all tests are passing. |
| **6. Commit** | `git commit -m "type(scope): #TICKET subject"` | Use [Conventional Commits][git-rules] format. |
| **7. Push** | `git push origin feature/#TICKET-name` | Push and open a Merge Request to `develop`. |

---

## Types of Contributions

| Type | Guidelines |
| :--- | :--- |
| **🐛 Bug Reports** | Use the issue template. Include minimal reproduction steps, expected vs actual behavior, and environment details (Node.js version). |
| **✨ Feature Requests** | Describe the use case. Must fit the scope (translation, pluralization, locale switching). |
| **🌐 Translator** | In `src/translator.ts`. Use Laravel-style `:attribute` replacement. The data is validated with `zod` (`src/schemas.ts`). |
| **🔢 Pluralization** | In `src/pluralization.ts`. Follow the `{0} \| {1} \| [2,*] :count` Laravel pattern exactly. |
| **📦 Types** | In `src/types.ts`. Keep all interfaces stable and backward compatible. |
| **🌍 Locale Handling** | Fallback chain must remain predictable. Cover edge cases (missing key, missing locale) in tests. |

---

## Quality Targets

| Command | Tool | Description |
| :--- | :--- | :--- |
| `make quality` | All | Full static analysis and formatting gate. |
| `make quality-fix` | All | Apply the fixes that the tools can make. |
| `make eslint` | ESLint | Run JS/TS static analysis. |
| `make prettier` | Prettier | Check code formatting. |
| `make typecheck` | TSC | Run TypeScript type checking. |
| `make knip` | Knip | Detect dead code and unused dependencies. |
| `make markdownlint` | Markdownlint | Validate Markdown documentation. |
| `make test` | Vitest | Run the unit tests. |
| `make test-coverage` | Vitest | Run the unit tests with the coverage report (`coverage/`): 75 % at least, as the base requires. |
| `make bats` | BATS | Run shell script integration tests. |

---

[handbook-contributing]: https://gitlab.com/zairakai/handbook/-/blob/main/CONTRIBUTING.md
[git-rules]: https://gitlab.com/zairakai/handbook/-/blob/main/policies/git-rules.md
