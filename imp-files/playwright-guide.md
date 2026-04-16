To create the `.md` file, copy the code block below and save it as `PLAYWRIGHT_GUIDE.md` on your computer.

````markdown
# Playwright E2E Testing Guide - GTM UI MFE

> Reference for setting up and understanding Playwright in this project from scratch.

---

## 1. What is Playwright Here?

Playwright automates a real browser (Chrome) to test the app exactly as a user would.

```text
Your test code -> Playwright -> Chrome -> Container App (localhost.avathon.com:3000)
                                           |--- GTM MFE (loaded via Module Federation)
```
````

---

## 2. Project Architecture (Why It's Complex)

This is **not** a standalone app. It is a **Micro Frontend (MFE)** inside a container:

```text
core-ui-container (port 3000)
|--- Provides Keycloak auth via @core-ui/components
|--- Provides platform context (org, roles, permissions)
|--- Loads GTM MFE at /gtm/* via Module Federation
     |--- gtm-ui-mfe (this repo)
          |--- /gtm/product-lookup
          |--- /gtm/bulk-classification
          |--- ... other routes
```

**Key consequence:** You cannot test the MFE in isolation.
You MUST run the container first, then run tests against it.

---

## 3. File Structure

```text
gtm-ui-mfe/
├── playwright.config.ts      # Main config (timeouts, browser, auth)
├── tsconfig.playwright.json  # TypeScript config scoped to tests/
├── .env.test                 # Test credentials (gitignored)
├── tests/
│   ├── global-setup.ts       # Runs ONCE before all tests: handles login
│   ├── .auth/
│   │   └── user.json         # Saved browser session (gitignored)
│   ├── e2e/
│   │   ├── fixtures/
│   │   │   └── auth.fixture.ts  # Custom test helpers (gotoGTM, waitForPlatformReady)
│   │   └── product-lookup.spec.ts # Actual tests
```

---

## 4. Step-by-Step: Initialize From Scratch

### Step 1 — Install Playwright

```bash
npm init playwright@latest
# Choose:
# Where to put tests? - tests/e2e
# Add GitHub Actions? - No (unless needed)
# Install browsers? - Yes
```

### Step 2 — Install required browsers

```bash
npx playwright install chromium
```

### Step 3 — Create `.env.test` in the project root

```bash
# .env.test - DO NOT commit this file
TEST_EMAIL=your-email@avathon.com
TEST_PASSWORD=yourpassword
CONTAINER_URL=https://localhost.avathon.com:3000/
```

### Step 4 — Make sure `.env.test` is gitignored

```text
# .gitignore
tests/.auth
.env.test
```

### Step 5 — Run the container first

```bash
# In core-ui-container directory:
npm run start
# Wait until it says it's ready on https://localhost.avathon.com:3000
```

### Step 6 — Run tests

```bash
# Headless (CI-style):
npm run test:e2e

# Interactive UI mode (recommended for debugging):
npm run test:e2e:ui

# Force a fresh Keycloak login:
FORCE_LOGIN=true npm run test:e2e
```

---

## 5. How Authentication Works

### The Problem

The app uses **Keycloak SSO** provided by the container. The MFE does not have its own login — it inherits auth from the container via Module Federation's shared scope.

### The Solution: `global-setup.ts` + `storageState`

**FIRST RUN:**
`global-setup.ts`

1.  **Step 1: POST to Keycloak token endpoint (no browser needed)**
    URL: `https://auth.dev-platform.avathon.com/realms/dev-sandbox/protocol/openid-connect/token`
    Body: `grant_type=password&client_id=avathon-container&username=...`
    Gets back: `{ access_token, refresh_token, id_token }`
2.  **Step 2: Open headless browser**
    Inject tokens into `sessionStorage/localStorage` BEFORE page loads.
    Navigate to container -> Keycloak-js finds tokens -> **authenticated ✅**
3.  **Step 3: Save full browser session to `tests/.auth/user.json`**
    (This includes cookies + localStorage with Keycloak tokens)

**EVERY SUBSEQUENT TEST:**
`playwright.config.ts` -> `storageState: 'tests/.auth/user.json'`
Each test starts already logged in — no login overhead.

**REPEAT RUNS (within 8 hours):**
`global-setup.ts` checks file age -> skips login entirely ✅
To force re-login: `FORCE_LOGIN=true`

### Fallback: If Keycloak Direct Grant is disabled

If the Keycloak client doesn't have "Direct access grants" enabled, the setup falls back to browser-based login:

- Opens the container URL
- Gets redirected to Keycloak login page
- Fills username -> clicks Login -> fills password -> clicks Login
- Waits for redirect back to the container

---

## 6. The Config File (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e', // Where tests live
  timeout: 60_000, // Per-test timeout (60s - MFE boot is slow)
  globalSetup: './tests/global-setup.ts', // Runs login once

  use: {
    baseURL: 'https://localhost.avathon.com:3000/',
    ignoreHTTPSErrors: true, // Self-signed cert on localhost.avathon.com
    storageState: 'tests/.auth/user.json', // Saved Keycloak session
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
})
```

**Key: `ignoreHTTPSErrors: true`**
The local dev server uses a self-signed SSL certificate. Without this, the browser refuses to connect.

**Key: `timeout: 60_000`**
Module Federation downloads MFE chunks lazily. First navigation to an MFE route can take 5-15 seconds.

---

## 7. The Fixture File (`auth.fixture.ts`)

Fixtures are reusable helpers injected into every test via destructuring:

```typescript
test('my test', async ({ page, gotoGTM, waitForPlatformReady }) => {
  // ...
})
```

---

## 8. Writing a New Test

```typescript
import { test, expect } from '../fixtures/auth.fixture'

test.describe('My Feature', () => {
  test.beforeEach(async ({ gotoGTM, waitForPlatformReady }) => {
    await gotoGTM('my-route') // e.g. 'bulk-classification'
    await waitForPlatformReady() // wait for auth + sidebar
  })

  test('page title is visible', async ({ page }) => {
    await expect(page.getByText('My Page Title')).toBeVisible()
  })

  test('button click works', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

### Available GTM Routes

| Route                       | Page Description            |
| :-------------------------- | :-------------------------- |
| `/gtm/product-lookup`       | Product Classification page |
| `/gtm/bulk-classification`  | Bulk Classification         |
| `/gtm/exception-management` | Exception Management        |
| `/gtm/review-management`    | Review Management           |
| `/gtm/settings`             | Settings                    |
| `/gtm/report`               | Reports                     |
| `/gtm/report/history`       | Report History              |
| `/gtm/user-analytics`       | Analytics                   |
| `/gtm/suppliers`            | Supplier Network            |
| `/gtm/product`              | Product Master              |

---

## 9. Common Pitfalls & Solutions

| Problem                                     | Cause                                                         | Fix                                                              |
| :------------------------------------------ | :------------------------------------------------------------ | :--------------------------------------------------------------- |
| Test times out at `networkidle`             | SPAs never reach networkidle (background polling, WebSockets) | Use element-based waits instead: `page.getByText(...).waitFor()` |
| Navigates to base path instead of MFE route | `createBrowserRouter` SPA — hard reload loses context         | Use `history.pushState` via `page.evaluate()` in `gotoGTM`       |
| `ERR_CERT_AUTHORITY_INVALID`                | Self-signed cert on `localhost.avathon.com`                   | `ignoreHTTPSErrors: true` in config + newContext                 |
| Login runs on every UI mode launch          | `globalSetup` runs each time                                  | Session cache in `global-setup.ts` — skips if < 8h old           |
| Token injection doesn't work                | Keycloak Direct Grant disabled on client                      | Falls back to browser login automatically                        |
| `Cannot find module '@playwright/test'`     | Playwright not installed                                      | `npm init playwright@latest`                                     |

---

## 10. Running on CI

```yaml
# .github/workflows/e2e.yml
name: Run E2E Tests
env:
  TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
  TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
  CONTAINER_URL: https://your-staging-url.com
run: npx playwright test --project=chromium
```

**Notes for CI:**

- Set `TEST_EMAIL` and `TEST_PASSWORD` as repository secrets.
- `workers: 1` is already configured on CI (prevents auth race conditions).
- `retries: 2` is already configured on CI.

---

## 11. Useful Commands

### Run all tests

```bash
npm run test:e2e
```

### Open interactive UI (best for development)

```bash
npm run test:e2e:ui
```

### Debug a specific test

```bash
npm run test:e2e:debug
```

### Run only one spec file

```bash
npx playwright test tests/e2e/product-lookup/product-lookup.spec.ts
```

### Force fresh Keycloak login

```bash
FORCE_LOGIN=true npm run test:e2e
```

### View the last HTML report

```bash
npx playwright show-report
```

### Generate test code by clicking in the browser

```bash
npx playwright codegen https://localhost.avathon.com:3000/
```

### Install/update browsers

```bash
npx playwright install
```

```

```
