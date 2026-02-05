# Followup Frontend — feature/robot_work_1

Project version: 3.9.3 (package). Goal: modernize the Angular/Ionic app for Followup v4.

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
