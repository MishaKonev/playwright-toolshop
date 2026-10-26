# Toolshop Test Automation — Playwright + TypeScript

[![Playwright Tests](https://github.com/GITHUB_USER/playwright-toolshop/actions/workflows/playwright.yml/badge.svg)](https://github.com/GITHUB_USER/playwright-toolshop/actions/workflows/playwright.yml)
[![Test report](https://img.shields.io/badge/report-GitHub%20Pages-blue)](https://GITHUB_USER.github.io/playwright-toolshop/)

End-to-end UI and REST API test automation framework for
[Practice Software Testing — Toolshop](https://practicesoftwaretesting.com), a demo e-commerce
application built for testing practice.

**Author:** Mykhailo Koniev — QA Automation Engineer ·
[LinkedIn](https://linkedin.com/in/mykhailo-koniev)

📊 **Latest HTML report:** https://GITHUB_USER.github.io/playwright-toolshop/

## What this project demonstrates

| Area                     | How                                                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page Object Model**    | One class per page in [`pages/`](pages), shared header actions in `BasePage`                                                                                                  |
| **Custom fixtures**      | Page objects, an API client and a freshly registered customer are injected into tests ([`pages/testExtender.ts`](pages/testExtender.ts))                                      |
| **Fast authentication**  | A setup project logs in **via API** and saves `storageState`, so UI tests start signed in without going through the login form ([`tests/auth.setup.ts`](tests/auth.setup.ts)) |
| **API-driven test data** | Every run registers its own users through the API instead of relying on shared demo accounts                                                                                  |
| **REST API testing**     | Status codes, response schemas, validation errors (401 / 403 / 404 / 409 / 422), pagination and sorting ([`tests/api/`](tests/api))                                           |
| **RBAC testing**         | Admin, customer and guest access checked both in the UI and on the API ([`tests/rbac/`](tests/rbac), [`users.api.spec.ts`](tests/api/users.api.spec.ts))                      |
| **Network mocking**      | `page.route()` patches real API responses and simulates server errors ([`tests/mocks/`](tests/mocks))                                                                         |
| **E2E flows**            | Search, sorting, cart calculations and a full checkout                                                                                                                        |
| **CI/CD**                | GitHub Actions: type check + Prettier, tests in **3 parallel shards**, merged HTML report published to **GitHub Pages**, nightly run                                          |
| **Debugging**            | Traces, screenshots and videos kept for failed tests                                                                                                                          |
| **Docker**               | Run the whole suite in the official Playwright image                                                                                                                          |

## Tech stack

Playwright Test · TypeScript · Node.js · GitHub Actions · Docker · Prettier

## Project structure

```
├── .github/workflows/   # CI: lint, sharded test run, report publishing
├── fixtures/            # Credentials, URLs and storageState paths (env-driven)
├── helpers/
│   ├── api/             # ApiClient built on Playwright APIRequestContext
│   ├── mocks.ts         # page.route() mocks
│   └── payloads.ts      # Test data builders
├── interfaces/          # TypeScript types for API payloads and responses
├── pages/               # Page Objects + testExtender.ts with custom fixtures
├── tests/
│   ├── api/             # REST API tests (no browser)
│   ├── cart/            # Cart and checkout
│   ├── catalog/         # Search and sorting
│   ├── login/           # Authentication UI
│   ├── mocks/           # UI behaviour with mocked backend
│   ├── rbac/            # Role-based access control
│   └── auth.setup.ts    # API login → storageState for admin and customer
├── utils/               # Small shared helpers
└── playwright.config.ts
```

## Getting started

Requirements: Node.js 18+ (CI uses Node 22).

```bash
git clone https://github.com/GITHUB_USER/playwright-toolshop.git
cd playwright-toolshop
npm ci
npx playwright install chromium
```

No configuration is needed: the defaults point to the public demo. To override them, copy
`.env.example` to `.env`.

## Running tests

```bash
npm test              # everything
npm run test:smoke    # tests tagged @smoke
npm run test:api      # API tests only
npm run test:ui       # browser tests only
npm run report        # open the last HTML report
npx playwright test --ui   # interactive UI mode
```

With Docker:

```bash
docker build -t toolshop-tests .
docker run --rm toolshop-tests
```

## Notes

- The application under test is a public shared demo, so tests create their own data and never
  modify data that belongs to other users.
- The catalog loads products with an HTTP `QUERY` request and sends filters in the request body,
  so waits and mocks match on the request body rather than the URL.
