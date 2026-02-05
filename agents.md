# Followup Frontend — feature/robot_work_1

Project version: 3.3 (package lists 3.2.0). Goal: modernize the Angular/Ionic app for Followup v4.

## Findings

- Angular 11/Ionic 4 stack with RxJS 6.x and TSLint; many deps are several majors behind (Angular CLI 11, Ionic CLI 6, TypeScript 4.0, etc.).
- `postinstall` triggers a full production build; risky for CI and local installs.
- Mixed/possibly stray dependencies (e.g., `react-scripts` in an Angular project) and outdated tooling (husky v3, prettier 1.x, protractor/karma stack).
- Service worker enabled in production build; needs validation with current caching/content strategy.

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
