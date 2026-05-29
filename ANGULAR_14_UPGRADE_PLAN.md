# Angular 12 → 14 LTS Upgrade Instructions

**Execute these commands in the terminal:**

```bash
cd /Users/seanhalls/Desktop/sh/clients/followup_master/v4.0.0/followup-frontend

# Step 1: Execute ng update to 14
ng update '@angular/cli@^14' '@angular/core@^14' --allow-dirty --force

# Step 2: Reinstall dependencies
npm ci

# Step 3: Build to validate
npm run build -s

# Step 4: Run linting
npm run lint:ts

# Step 5: Run test suite
npm test -- --runInBand --bail
```

---

## Expected Changes in Angular 14

### Package Updates

- `@angular/cli`: 12.2.18 → **14.2.10** (LTS)
- `@angular/core`: 12.2.17 → **14.2.10** (LTS)
- `@angular-devkit/build-angular`: 12.2.18 → **14.2.10**
- `typescript`: 4.3.5 → **4.7.4** or higher
- `zone.js`: 0.11.8 → **0.12.0**
- `karma`: 6.4.4 → **6.4.2** (may stay same)

### Configuration Changes

- `angular.json`: Build options may be restructured
- `tsconfig.json`: May add stricter compiler options
- Deprecated options in ng serve/build removed

### API Changes in Angular 14

- **Typed Forms** introduced (optional)
- **Standalone components** available (not required for legacy apps)
- **Stricter checks** enabled by default
- Service worker format may update

### Code Impact (Likely None)

- RxJS remains 6.x (compatible, can upgrade to 7.x in future phase)
- Ionic 5.9.4 remains compatible with Angular 14
- ESLint configuration stays compatible
- No breaking changes to existing Angular 11/12 patterns

---

## Post-Upgrade Validation Checklist

After running the commands above:

- [ ] `npm run build -s` succeeds (prod bundle in dist/)
- [ ] `npm run lint:ts` passes (0 new ESLint errors)
- [ ] `npm test -- --runInBand` passes all 348 tests
- [ ] Service worker artifacts present in dist/ (ngsw-worker.js, ngsw.json)
- [ ] `npm run serve` starts dev server on localhost:4200
- [ ] No new TypeScript compilation errors
- [ ] agents.md updated with 2026-05-29 entry for Angular 14 upgrade

---

## Rollback Plan

If Angular 14 causes issues:

```bash
git checkout HEAD -- package.json package-lock.json angular.json
npm ci
npm run build -s
```

---

## Next Steps After Angular 14

**Future phases:**

1. **Angular 14 → 16 LTS** (April 2023, 2 year support)

   - TypeScript 4.7+ already compatible
   - More strict checking
   - Angular Router changes

2. **Angular 16 → 17 LTS** (November 2023, cutting edge)

   - TypeScript 5.0+
   - New control flow syntax (@if, @for)
   - Standalone API becomes default

3. **Parallel work:**
   - Ionic 5.x → 6.x compatibility
   - RxJS 6.x → 7.x upgrade
   - ESLint rule modernization

---

**Status**: Ready for Angular 14 upgrade. Execute the commands above and report back with results.
