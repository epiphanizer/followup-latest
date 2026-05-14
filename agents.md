# Followup Frontend — feature/robot_work_1

Project version: 3.10.0-rc3 (package). Goal: modernize the Angular/Ionic app for Followup v4.

## Findings

- Angular 11/Ionic 4 stack with RxJS 6.x and TSLint; many deps are several majors behind (Angular CLI 11, Ionic CLI 6, TypeScript 4.0, etc.).
- `postinstall` build disabled (was running prod build) to unblock installs on modern Node; build still fails on Node 24 until toolchain is upgraded.
- Mixed/possibly stray dependencies (e.g., `react-scripts` in an Angular project) and outdated tooling (husky v3, prettier 1.x, protractor/karma stack).
- Service worker enabled in production build; needs validation with current caching/content strategy.

## Module map (src/app/modules)

- call-queue — queue views/listing.
- data — data utilities/helpers.
- notification — notifications listing.
- operation — operation domain.
- patient — patient listing/detail flows.
- team — team domain.
- user — user domain/auth flows.

Shared/core scaffolding

- shared: calendar, dialog, directives, form, filters/search, loader/menu/pagination, pipes, upload service.
- core: api.service, auth, http, i18n, logger, route reuse, until-destroyed helper.

## Agent-friendly quickstart

- Use Node 18/20; npm 9/10. Install: `npm install` (postinstall is no-op).
- Build (requires OpenSSL legacy on Node 24, avoid): `npm run build`.
- Serve dev: `npm run serve` (proxy 4200).
- Tests: `npm test`; Lint: `npm run lint` (TSLint + stylelint + htmlhint).

## Automation blockers to resolve

- Peer warning: `@biesbjerg/ngx-translate-extract` → `@phenomnomnominal/tsquery` wants TS 3.x; upgrade or replace to drop warning.
- Legacy lint/test stack (TSLint, Protractor, Karma) complicates CI; migrate to ESLint + Cypress/Playwright + modern Jest/Karma.
- Many audited vulnerabilities (legacy deps); will clean during modernization.

## Plan

1. Upgrade path: step through Angular 12→17 (or latest LTS) with CLI migrations; align Ionic and RxJS accordingly; move to TypeScript >=5 and zone.js updates.
2. Tooling: replace TSLint with ESLint, update Husky and Prettier, and revisit lint/test commands; remove `postinstall` build.
3. Dependency hygiene: drop unused/stray packages (e.g., react-scripts), audit all deps, and modernize polyfills.
4. Testing: migrate from Protractor to Cypress or Playwright; keep Karma/Jasmine or move to Jest for unit tests; ensure CI uses headless runs.
5. PWA/Service worker: review `ngsw-config` and caching rules post-upgrade; validate manifest/assets.
6. DX/UX: improve env handling, proxy config, and consider component-level theming refresh during v4.

## Notes

- Build: `npm run build`; Serve dev: `npm run serve` (proxy on 4200).
- Working branch: feature/robot_work_1.
- Before closing work, verify builds/tests or note why they were not run.

## Running change log (frontend)

- 2026-05-14: Captured alpha frontend baseline response benchmark for `https://alpha-followupcare.azurewebsites.net/` (30 requests): HTTP 200 success `30/30`, average `140.3ms`, p50 `118.3ms`, p95 `206.9ms`, min `110.1ms`, max `212.0ms`. This is now the reference point for subsequent queue/home optimization validation.
- 2026-05-14: Implemented first-pass frontend performance improvements for home and call queue: [call-queue-patient-listing.component.ts](src/app/modules/call-queue/call-queue-patient-listing/call-queue-patient-listing.component.ts) now uses `OnPush`, removed an unused call-status fetch, and adds `trackBy` support in [call-queue-patient-listing.component.html](src/app/modules/call-queue/call-queue-patient-listing/call-queue-patient-listing.component.html) to reduce re-renders; avatar pipeline now deduplicates in-flight requests in [patient-avatar.service.ts](src/app/modules/patient/patient-avatar/patient-avatar.service.ts) and reuses in-memory/session cache in [patient-avatar.component.ts](src/app/modules/patient/patient-avatar/patient-avatar.component.ts); home dashboard now renders primary metrics without blocking on team totals in [home.component.ts](src/app/home/home.component.ts). Verified with successful `npm run build -s`.
- 2026-05-14: Promoted frontend release metadata to 3.10.0-rc3 on `alpha` by updating [package.json](package.json), [package-lock.json](package-lock.json), and [src/environments/.env.ts](src/environments/.env.ts) to prep coordinated rc3 alpha deployment.
- 2026-05-14: Confirmed rc3 alpha frontend deployment completed successfully: GitHub Actions run `25835387407` (`chore(release): bump frontend to 3.10.0-rc3`) is `completed/success` (updated `2026-05-14T01:08:16Z`) at https://github.com/epiphanizer/followup-latest/actions/runs/25835387407.
- 2026-05-13: Implemented Azure Application Insights frontend telemetry baseline for SOW monitoring: added `@microsoft/applicationinsights-web`, introduced [src/app/core/telemetry.service.ts](src/app/core/telemetry.service.ts), initialized telemetry/page-view tracking in [src/app/app.component.ts](src/app/app.component.ts), and wired HTTP exception capture in [src/app/core/http/error-handler.interceptor.ts](src/app/core/http/error-handler.interceptor.ts).
- 2026-05-13: Added build-time telemetry env support in [src/environments/environment.ts](src/environments/environment.ts), [src/environments/environment.alpha.ts](src/environments/environment.alpha.ts), [src/environments/environment.prod.ts](src/environments/environment.prod.ts), and alpha workflow env passthrough in [.github/workflows/alpha_alpha-followupcare.yml](.github/workflows/alpha_alpha-followupcare.yml) using `APP_INSIGHTS_CONNECTION_STRING` / `APPLICATIONINSIGHTS_CONNECTION_STRING`.
- 2026-05-13: Started Phase 2 Ionic safety-step upgrade on `alpha`: bumped `@ionic/angular` from `5.8.0` to `5.9.4` in [package.json](package.json) and regenerated [package-lock.json](package-lock.json).
- 2026-05-13: Post-upgrade sanity check passed via production build (`npm run build -s`) on current branch; no new Ionic-related compile failures observed (existing legacy warnings unchanged).
- 2026-05-13: Post-upgrade regression run passed: `npm test -- --runInBand` completed with 110/110 test suites passing and 348/348 tests passing.

- 2026-05-12: Created branch `v3100_dependency_audit` for v3.10.0 frontend Phase 2 hardening and reran `npm audit --audit-level=high` baseline.
- 2026-05-12: Executed `npm audit fix` (non-force) on `v3100_dependency_audit`; lockfile refreshed but no safe non-breaking framework fixes were available. Frontend remains at 198 vulnerabilities (26 low, 79 moderate, 85 high, 8 critical), with `--force` paths requiring major Angular/Ionic toolchain movement deferred to Phase 3.
- 2026-05-12: Hardened frontend login error handling in [src/app/core/authentication/auth.service.ts](src/app/core/authentication/auth.service.ts) and [src/app/login/login.component.ts](src/app/login/login.component.ts) to preserve backend status/message context and differentiate invalid credentials (401) from service/runtime failures.
- 2026-05-12: Stabilized patient and notification listing sidebars by separating operation-group toggle headers from operation links, removing forced-open coupling, and syncing selected operation between listing and sidebar; updates in [src/app/modules/patient](src/app/modules/patient) and [src/app/modules/notification](src/app/modules/notification) with focused Jest coverage.
- 2026-05-12: Fixed operations/facilities page rendering regressions by hardening operation listing/sidebar selection logic against sparse resolver payloads, correcting operation-group output binding in [src/app/modules/operation/operation-listing/operation-listing.component.html](src/app/modules/operation/operation-listing/operation-listing.component.html), and adding fallback hydration by `operationGroupId` in [src/app/modules/operation/operation-listing/operation-listing.component.ts](src/app/modules/operation/operation-listing/operation-listing.component.ts).
- 2026-05-12: Added/updated operation regression coverage for missing group data and fallback hydration in [src/app/modules/operation/operation-listing/operation-listing.component.spec.ts](src/app/modules/operation/operation-listing/operation-listing.component.spec.ts) and [src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts](src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts).
- 2026-05-12: Updated Hospital Admitted contract assertions in [src/app/modules/patient/patient-form/patient-form.component.spec.ts](src/app/modules/patient/patient-form/patient-form.component.spec.ts) to reflect dual payload mapping (`patientHospitalAdmitted` + `patientPrimaryInsurance`).
- 2026-05-12: Extended call queue sidebar behavior and spec coverage for spanish-link new-discharge indicator in [src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.ts](src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.ts) and [src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.spec.ts](src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.spec.ts).
- 2026-05-12: Focused regression suite run passed for operation modules (3 suites, 12 tests).
- 2026-05-10: Promoted frontend release to 3.10.0 on alpha (`package.json`, `package-lock.json`, and `src/environments/.env.ts`), validated alpha build, and pushed `v3.10.0` tag.
- 2026-05-10: Updated alpha deployment workflow for App Service stability: - switched `actions/upload-artifact`/`actions/download-artifact` to `@v5`; - moved deploy path to publish profile (with OIDC fallback) in [v3.10.0/followup-frontend/.github/workflows/alpha_alpha-followupcare.yml](v3.10.0/followup-frontend/.github/workflows/alpha_alpha-followupcare.yml); - current blocker is credential configuration in GitHub environment `alpha` (missing publish profile and/or OIDC subject mismatch).
- 2026-05-10: Confirmed all frontend `feature/v399-*` branches are merged into alpha.

- 2026-02-06: Synced toolbar permissions to impersonated user and added return-to-admin action in the shell dropdown.
- 2026-02-06: Guarded call queue patient fetches to avoid undefined operation IDs that can leave requests pending.

- 2026-02-06: Logout now clears and redirects even when the API is down; added logout failure coverage; relaxed shell layout height to prevent banner clipping.
- 2026-02-06: Added impersonation fallback to fetch user details when the API returns 405 for /users/impersonate.
- 2026-02-06: Aligned notification modal sizing with followup-complete modal and enabled textarea autogrow.
- 2026-02-06: Restored login-as-user action in team detail, re-added impersonation plumbing, and fixed failing unit spec typings.

## Current tasklist (frontend)

- [x] Phase 2 frontend dependency-audit branch created and non-breaking `npm audit fix` pass recorded.
- [x] Operations/facilities rendering hardening and focused regression coverage.
- [x] Hospital Admitted frontend contract/spec alignment.
- [x] Spanish queue link indicator computation and call queue sidebar coverage.
- [ ] Frontend residual vulnerability triage: schedule force-level dependency upgrades (Angular CLI/build stack, Karma/Stylelint chains) under Phase 3 modernization window.
- [ ] DOR-CQ-01 portal phone mapping on caller face sheet: complete endpoint-to-UI parity verification.
- [ ] DOR-CQ-02 duplicate contacts flow audit: validate API result shape vs UI dedupe rendering.
- [ ] DOR-CQ-03 and DOR-NP-03 spanish queue routing/indicator behavior: verify end-to-end in queue views.
- [ ] DOR-NP-02 add/edit Hospital Admitted flow: complete frontend smoke validation against current API persistence.
- [ ] DOR-OP-01 ownership/client rename propagation through operation and WZ naming views.
