# Followup Frontend — feature/robot_work_1

Project version: 3.10.0 (package). Goal: modernize the Angular/Ionic app for Followup v4.

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

- 2026-05-10: Promoted frontend release to 3.10.0 on alpha (`package.json`, `package-lock.json`, and `src/environments/.env.ts`), validated alpha build, and pushed `v3.10.0` tag.
- 2026-05-10: Updated alpha deployment workflow for App Service stability: - switched `actions/upload-artifact`/`actions/download-artifact` to `@v5`; - moved deploy path to publish profile (with OIDC fallback) in [v3.10.0/followup-frontend/.github/workflows/alpha_alpha-followupcare.yml](v3.10.0/followup-frontend/.github/workflows/alpha_alpha-followupcare.yml); - current blocker is credential configuration in GitHub environment `alpha` (missing publish profile and/or OIDC subject mismatch).
- 2026-05-10: Confirmed all frontend `feature/v399-*` branches are merged into alpha.

- 2026-02-06: Synced toolbar permissions to impersonated user and added return-to-admin action in the shell dropdown.
- 2026-02-06: Guarded call queue patient fetches to avoid undefined operation IDs that can leave requests pending.

- 2026-02-06: Logout now clears and redirects even when the API is down; added logout failure coverage; relaxed shell layout height to prevent banner clipping.
- 2026-02-06: Added impersonation fallback to fetch user details when the API returns 405 for /users/impersonate.
- 2026-02-06: Aligned notification modal sizing with followup-complete modal and enabled textarea autogrow.
- 2026-02-06: Restored login-as-user action in team detail, re-added impersonation plumbing, and fixed failing unit spec typings.
