# AgriWeb E2E — Phased roadmap

Phases **0–6** are implemented. **Phase 7** is optional long-term regression.

---

## Phase 0 — Done (baseline)

**Goal:** CI can fail fast if stack is down or admin is broken.

| Scope | Covered |
|-------|---------|
| Docker + API health | `global-setup.ts` |
| Public smoke | home, login/register/news, admin host login |
| Auth | farmer login UI, bad password, investor session |
| Admin | sidebar nav, list page headings, no red API error banner |
| Admin | 2 login UI tests, dashboard, a few detail URLs, create form **open only** |
| Artifacts | screenshot / video / trace on failure |

**Run:** `npm run test:e2e`  
**Tag:** `@smoke` on public + farmer/investor flow specs

---

## Phase 1 — API contract layer ✅

**Run:** `npm run test:e2e:api`  
**Tag:** `@api`

---

## Phase 2 — Admin list interactions ✅

**Run:** `npm run test:e2e:admin e2e/admin/lists-interaction.spec.ts`  
**Tag:** `@admin`

---

## Phase 3 — News category CRUD ✅

| Deliverable |
|-------------|
| `data-testid` on `NewsCategoryModal` + add button |
| `e2e/admin/crud-news-category.spec.ts` |
| API teardown in `afterAll` |

**Run:** `npm run test:e2e:crud`  
**Tag:** `@crud`

---

## Phase 4 — Admin detail & actions ✅

**File:** `e2e/admin/detail-actions.spec.ts`  
**Fixture:** `e2e/.api-fixture.json` (written in `global-setup.ts`)

---

## Phase 5 — Main app critical paths ✅

**Files:** `e2e/farmer/flows.spec.ts`, `e2e/investor/flows.spec.ts`  
Register farmer + logout flows.

---

## Phase 6 — Hardening & CI ✅

| Item | Location |
|------|----------|
| GitHub Actions | `.github/workflows/e2e.yml` |
| Artifacts | `playwright-report/`, `test-results/` |
| `E2E_MINIMAL_DB` | list + CI job |
| Tags | `@smoke`, `@admin`, `@crud`, `@api` |
| Scripts | `test:e2e:smoke`, `test:e2e:admin`, `test:e2e:crud` |

---

## Phase 7 — Full regression (optional, long-term)

**Not started** — see original list in git history.

---

## Suggested commands

```bash
npm run test:e2e              # all projects
npm run test:e2e:api            # Phase 1
npm run test:e2e:smoke          # @smoke
npm run test:e2e:admin          # admin browser
npm run test:e2e:crud           # @crud
npm run test:e2e:ui
npm run test:e2e:report
```

## File layout

```text
e2e/
  PHASES.md
  README.md
  global-setup.ts          # + .api-fixture.json
  fixtures/admin-api.ts
  api/admin.contract.spec.ts
  admin/
    helpers.ts
    lists-interaction.spec.ts
    crud-news-category.spec.ts
    detail-actions.spec.ts
    … (Phase 0 specs)
  farmer/flows.spec.ts
  investor/flows.spec.ts
```