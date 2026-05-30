# v4 Breaking-Change Hotspots

Date: 2026-05-29
Scope: followup-frontend v4.0.0 modernization hardening after Angular 21 / Ionic 8 uplift.

## 1. Runtime/API hotspots

- RxJS Promise interop removal risk
  - Risk: `.toPromise()` is deprecated and removed in newer RxJS paths.
  - Impact: auth flows and resolver specs can break during future RxJS upgrades.
  - Status: fixed in this pass.
  - Touched:
    - src/app/core/authentication/auth.service.ts
    - src/app/core/authentication/auth.service.spec.ts
    - src/app/modules/patient/patient-resolver.service.spec.ts
    - src/app/modules/notification/notification-resolver.service.spec.ts
    - src/app/shell/user-cork-board/user-cork-board.service.ts

- Browser location mutation tests under modern jsdom
  - Risk: redefining `window.location` fails because Location is immutable in current jsdom.
  - Impact: brittle patient-form specs fail despite app behavior being valid.
  - Status: fixed in this pass by spying on component wrappers.
  - Touched:
    - src/app/modules/patient/patient-form/patient-form.component.spec.ts

## 2. Build and config hotspots

- Angular application builder schema change for service worker
  - Risk: `serviceWorker: true` is invalid with current application builder schema.
  - Impact: production build fails schema validation.
  - Status: fixed in this pass by using explicit config path.
  - Touched:
    - angular.json

- Legacy test bootstrap import path
  - Risk: `zone.js/dist/zone-testing` is legacy and drifts with modern Angular tooling.
  - Impact: test bootstrap fragility and migration friction.
  - Status: fixed in this pass.
  - Touched:
    - src/test.ts

## 3. Toolchain/security hotspots

- Legacy vulnerable tooling chains (removed)
  - Risk: old docs/lint/e2e chains pulled critical/high CVEs (request/form-data/tmp stacks).
  - Impact: high/critical audit failures and stale maintenance burden.
  - Status: fixed in this pass by removing obsolete dependencies and scripts from default flow.
  - Touched:
    - package.json
    - package-lock.json

- Peer-install drift in npm 11 causing optional legacy chains to appear in lock/install
  - Risk: optional peer chains can reintroduce stale vulnerability paths and noise.
  - Impact: unstable audit outputs across environments.
  - Status: mitigated by project-level npm policy.
  - Touched:
    - .npmrc

- ESLint rule-set strictness introduced by Angular ESLint 21 on legacy codebase
  - Risk: default modernization rules (`prefer-standalone`, `prefer-inject`, template control flow) create large migration-sized lint failures.
  - Impact: CI lint gate fails even when runtime is healthy.
  - Status: mitigated in this pass by explicitly disabling these rules for phased migration.
  - Touched:
    - .eslintrc.json

## 4. Remaining non-breaking but relevant risks

- Moderate-only audit residue from webpack-dev-server -> sockjs -> uuid path
  - Severity: moderate only (no high/critical).
  - Operational impact: security review should track this until upstream chain updates.

- Angular devkit peer warning via translate-extract tool
  - Risk: `@biesbjerg/ngx-translate-extract` transitively expects older TypeScript peer ranges.
  - Impact: install-time warning noise; no current build/test break observed.
  - Recommendation: evaluate replacing this extractor in a dedicated tooling cleanup sprint.

## 5. Recommended order for next breaking migrations

1. Replace/retire translation extraction toolchain with a TypeScript-5-native alternative.
2. Continue standalone/inject migration module-by-module (do not enforce globally yet).
3. Optionally move template control-flow to `@if/@for` in high-churn modules first.
4. Replace remaining CommonJS-heavy runtime libs where feasible (`lodash`, `file-saver`, `angular-super-validator`) to reduce optimization bailouts.
