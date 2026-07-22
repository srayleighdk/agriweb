# AgriWeb E2E (Playwright)

## Prerequisites

1. Stack running (from repo root):

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

2. `127.0.0.1 admin.localhost` in `/etc/hosts` (for admin tests).

3. Optional env:

   ```bash
   cp e2e/.env.test.example e2e/.env.test
   ```

   Default passwords match Docker DB seed (`password123` for test users).

## Run

```bash
cd agriweb
npm install
npx playwright install chromium
npm run test:e2e
```

## Debug failures (screenshots, video, trace)

On failure, artifacts are saved under `test-results/`. Open the HTML report:

```bash
npm run test:e2e:report
```

- **Screenshot**: `only-on-failure` per test  
- **Video / trace**: `retain-on-failure` — use trace viewer from the report  

Interactive mode:

```bash
npm run test:e2e:ui
```

## Phased roadmap

See **`e2e/PHASES.md`**. **Phase 0** = browser smoke; **Phase 1** = API contracts (no UI).

```bash
npm run test:e2e:api    # Phase 1 only (~4s)
npm run test:e2e        # all projects (api + main + admin)
npm run test:e2e -- --project=admin e2e/admin/lists-interaction.spec.ts  # Phase 2
```

Set `E2E_MINIMAL_DB=1` if DB is SQL-dump only (no MSVT/seed).

## Admin suite (Phase 0 — smoke CMS)

```bash
npm run test:e2e -- --project=admin
```

Covers: API seed check, all sidebar routes, list pages (no red error banners), detail pages, create forms, admin login UI.

Requires Docker DB seed (`agridb.sql`): **4 users**, **2 farmers**, **3 farmlands**, news data, etc.

## CI

Workflow: **`.github/workflows/e2e.yml`** (repo root) — Docker compose up → `test:e2e:api` + `@smoke` with `E2E_MINIMAL_DB=1`.

Local CI-like run:

```bash
CI=true E2E_MINIMAL_DB=1 npm run test:e2e:api && npm run test:e2e:smoke
```

## PR checklist

- [ ] `docker compose … up` and `npm run test:e2e` green locally (or at least `test:e2e:api` + `test:e2e:smoke`)
- [ ] New UI flows: add `data-testid` if selectors are brittle
- [ ] MSVT-dependent tests: guard with `E2E_MINIMAL_DB` or `test.skip`
- [ ] CRUD tests: clean up via API in `afterAll` / `afterEach`
- [ ] On failure: attach `playwright-report` or trace from `test-results/`

## Tags (grep)

| Tag | Command |
|-----|---------|
| `@api` | `npm run test:e2e:api` |
| `@smoke` | `npm run test:e2e:smoke` |
| `@admin` | `npm run test:e2e:admin` |
| `@crud` | `npm run test:e2e:crud` |