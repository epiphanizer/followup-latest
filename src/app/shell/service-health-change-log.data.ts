export interface ServiceHealthChangeLogEntry {
  scope: 'Frontend' | 'API' | 'Database' | 'Release' | 'Performance';
  summary: string;
  evidence: string;
  source: string;
}

export interface ServiceHealthChangeLogRelease {
  version: string;
  recordedAt: string;
  label: string;
  notes: string;
  entries: ServiceHealthChangeLogEntry[];
}

export const SERVICE_HEALTH_CHANGE_LOG: ServiceHealthChangeLogRelease[] = [
  {
    version: '4.0.9',
    recordedAt: '2026-08-26',
    label: 'Operations reliability and input hardening',
    notes:
      'Makes facility archiving durable, renews active DOT sessions, restores guided DOB entry, surfaces Hospital Info, and verifies patient-phone persistence.',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Hospital Info now appears with the persistent patient labels in the left-hand Patient Detail column.',
        evidence:
          'The stored Hospital Admitted value is shown conditionally alongside Medical Conditions, Primary Diagnosis, Discharged Condition, Need To Know, and patient history instead of being attached to one call. The display supports both the current patientHospitalAdmitted field and its existing patientPrimaryInsurance legacy alias, trims whitespace, and remains hidden when blank. Focused patient-notes coverage passes 2/2 tests.',
        source: 'v4.0.0 Patient Detail hospital context (2026-08-26)'
      },
      {
        scope: 'Frontend',
        summary:
          'Patient and user-profile birthdays now provide guided MM/DD/YYYY entry with semantic date validation.',
        evidence:
          'Both DOB fields use ngx-mask for automatic separators and a complete four-digit year while retaining numeric keyboards and birthday autofill. Patient DOB keeps its calendar picker, and both forms preserve the existing yyyy-MM-dd API payload. Validation rejects incomplete, impossible, and future birthdays instead of relying on formatting alone; valid leap dates are accepted. Focused patient/profile coverage passes 58/58 tests.',
        source: 'v4.0.0 DOB input hardening (2026-08-26)'
      },
      {
        scope: 'Frontend',
        summary:
          'Active DOT sessions now use a 45-minute inactivity window and renew their bearer token before the fixed server deadline.',
        evidence:
          'Mouse, click, wheel, touch, and keyboard activity extend one shared 45-minute idle deadline. While active, the shell checks every five minutes and requests renewal during the JWT final hour, allowing repeated transient-failure retries without overlapping requests. Activity deadlines synchronize across tabs. The protected API refresh route revalidates the database user, rejects inactive or deleted accounts, and issues a fresh eight-hour RS256 token; expired tokens and idle sessions cannot refresh. Focused frontend session coverage passes 29/29 tests and API coverage passes 10/10 tests.',
        source: 'v4.0.0 frontend/API renewable session hardening (2026-08-26)'
      },
      {
        scope: 'API',
        summary:
          'Patient edits now verify primary-phone persistence before reporting success while keeping patient and contact numbers distinct.',
        evidence:
          'A read-only production aggregate found 5,650 active Haven patients with a blank primary patient phone, but 5,644 still had a phone in the separate patientContacts table; only 6 lacked any phone path. The deployed edit procedure directly writes all three patient phone fields and no patient trigger touches phone data, ruling out broad database deletion. The API now verifies country code, area code, and phone after every patient edit. Contact numbers are not promoted into patient phone fields because they may belong to another person. No production data was changed.',
        source: 'v4.0.0 API Haven patient phone audit (2026-08-26)'
      },
      {
        scope: 'API',
        summary:
          'Facility archive now persists an explicit inactive state and archived facilities remain outside active queue and patient views.',
        evidence:
          'The facility form preserves numeric and string archive values instead of allowing numeric zero to default back to active. After a successful legacy facility edit, the API synchronizes and verifies operations.operationActive; the dedicated deactivate route also verifies the row after using its stored procedure or mixed-schema fallback. Existing queue-facing patient and call reads enforce both facility and parent-client active state, and post-save user hydration removes inactive facilities from active sidebars. Focused frontend archive/cache/queue coverage passes 83/83 tests and API coverage passes 8/8 tests with syntax validation across 71 files.',
        source: 'v4.0.0 frontend/API facility archive verification (2026-08-26)'
      },
      {
        scope: 'Release',
        summary: 'Promoted the complaint-driven frontend and API reliability fixes to matching version 4.0.9.',
        evidence:
          'Aligned frontend package and generated environment metadata, shell Service Health version assertions, and API package metadata for alpha and production promotion.',
        source: 'v4.0.0 release stamp (2026-08-26)'
      }
    ]
  },
  {
    version: '4.0.8',
    recordedAt: '2026-08-26',
    label: 'Final handoff optimization pass',
    notes:
      'Adds Active/Archived patient switching, reduces patient-history request fan-out, refreshes safely upgradable dependencies, and restores progressive patient-avatar hydration.',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Patient avatars now replace their placeholders as soon as each image finishes loading in the Call Queue.',
        evidence:
          'The patient-avatar component now explicitly marks its view for checking after the asynchronous FileReader callback stores the loaded image. This restores immediate rendering inside the OnPush Call Queue without requiring navigation away and back. Focused component coverage verifies the completed reader schedules a render.',
        source: 'v4.0.0/followup-frontend avatar hydration hotfix (2026-08-26)'
      },
      {
        scope: 'Frontend',
        summary:
          'Patient listings now default to Active records and can switch immediately to Archived records without another API request; call note review fields have hardened native spelling assistance.',
        evidence:
          'Added an accessible Active/Archived segmented control with counts. Sorting, searching, and pagination remain scoped to the selected view, Spanish mode keeps its existing queue behavior, and legacy rows without an active flag remain visible as active. The Edit & Review Call notes textarea and free-text call-question textarea now set both Ionic/native spellcheck bindings plus browser writing-assistance attributes. Focused patient-listing Jest passes 12/12 tests and focused call-note/question spellcheck Jest passes 9/9 tests.',
        source: 'v4.0.0/followup-frontend handoff hardening (2026-08-26)'
      },
      {
        scope: 'Performance',
        summary:
          'Call Queue and Patient Detail reads render progressively, login context reads run in parallel, patient notification history no longer requests replies once per notification, and call-question history hydrates in one patient-scoped request.',
        evidence:
          'Call Queue patient roster and same-day call-history GETs now use the existing `SKIP_GLOBAL_LOADER` context, so slow S2-backed queue reads do not hold the whole-page spinner after the route shell is ready. Patient Detail keeps the initial patient resolver blocking, then hydrates current call, call history, notifications, notification replies, contacts, languages, intake questions/answers, and completion-option prefetch progressively so secondary panels cannot pin the global spinner. Operation and operation-group hydration starts together through `forkJoin`. Patient notification history uses the existing patient-level reply endpoint once and groups replies in memory by notification id, replacing row-level reply fan-out. Patient call history now calls `/patients/{patientId}/calls/questions` once and groups question answers by call id instead of loading each contacted call separately. The matching stored procedure was applied to alpha `followup_alpha_20260517` and returned the expected 96 rows for the busiest sampled patient. Spanish call history was evaluated for indexed-view materialization, but the legal indexed-view shape cannot preserve the latest-admission and historical call-number semantics; the applied date-first procedure preserved output across the five busiest sampled dates while reducing alpha procedure time from about 1.2-1.4s to 45-88ms.',
        source: 'v4.0.0 frontend/API small-tier query audit (2026-08-26)'
      },
      {
        scope: 'Release',
        summary:
          'Applied all non-breaking dependency updates available on the current Angular 21 and legacy API router lines.',
        evidence:
          'Frontend audit findings dropped from 38 to 8 after patch/minor lockfile refresh. The remaining 4 moderate, 3 high, and 1 critical findings are build/dev-server transitives whose npm remediation requires Angular 22. API direct dependencies and safe legacy-router overrides were refreshed; the installed supported API tree now has two low findings and no moderate/high/critical findings.',
        source: 'v4.0.0 frontend/API dependency audit (2026-08-26)'
      },
      {
        scope: 'Release',
        summary: 'Promoted the frontend and API alpha candidates to matching version 4.0.8.',
        evidence:
          'Aligned frontend package metadata, generated environment metadata, shell Service Health manifest, and API package metadata for alpha deployment.',
        source: 'v4.0.0 alpha release stamp (2026-08-26)'
      }
    ]
  },
  {
    version: '4.0.7',
    recordedAt: '2026-08-25',
    label: 'Spanish call history performance hotfix',
    notes:
      'Scopes Spanish call history to the selected calendar date instead of downloading the entire historical call archive.',
    entries: [
      {
        scope: 'Performance',
        summary:
          'The Spanish Call Queue history panel no longer downloads tens of thousands of historical calls when it only displays one selected day.',
        evidence:
          'Application Insights showed `/spanish/calls` taking 26.5 seconds after the S2 database scale. Direct measurement found 28,432 rows and a 21.1 MB JSON payload. The frontend now sends the selected date, avoids global fallback loads while a normal operation input is unavailable, and caches Spanish history by date. API/SQL 3.12.17 scopes the response while preserving historical call numbering; rollback validation reduced the sample response from 21.1 MB to 570 bytes with equivalent output.',
        source: 'v4.0.0 frontend/API alpha performance investigation (2026-08-25)'
      },
      {
        scope: 'Release',
        summary: 'Promoted the frontend Spanish history hotfix to version 4.0.7.',
        evidence:
          'Aligned package metadata, generated environment metadata, shell version assertions, and this Service Health manifest for alpha deployment.',
        source: 'v4.0.0/followup-frontend release stamp (2026-08-25)'
      }
    ]
  },
  {
    version: '4.0.6',
    recordedAt: '2026-08-25',
    label: 'Workflow reliability and progressive loading',
    notes:
      'Alpha candidate covering safer form submissions, progressive avatar loading, resilient Notify access, draggable clinical dialogs, and native spelling assistance.',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Patient notes, notification messages and replies, and follow-up completion notes now opt into native spelling correction and sentence capitalization.',
        evidence:
          'Enabled `spellcheck`, OS/browser autocorrect, and sentence capitalization on patient call notes, free-text call questions, patient diagnosis/discharge/Need-to-Know fields, notification compose/review/reply fields, and completion notes. This uses the browser and device editing controls instead of introducing a third-party service that could receive clinical text. Six focused Jest suites pass 83/83 tests.',
        source: 'v4.0.0/followup-frontend session change (2026-08-25)'
      },
      {
        scope: 'Frontend',
        summary:
          'Notify is now always present for authenticated users, regardless of legacy role formatting, while other role-gated toolbar links normalize numeric, encoded, and label role values consistently.',
        evidence:
          'Removed the redundant `minRole` gate from the Notify action and replaced TypeScript enum reverse-map role parsing with explicit numeric-string, encoded-id, and role-label normalization. Read-only production SQL verification found active Lesa Thompson is Care Rep with 73 direct facilities and Steph Neff is active Admin; neither valid role should suppress Notify. Lesa also has one inactive legacy duplicate account, but its login fallback still resolves to Care Rep. Focused toolbar/shell Jest passes 28/28 tests, and browser verification confirms Notify renders for an unrecognized legacy session role.',
        source: 'v4.0.0/followup-frontend + production read-only audit (2026-08-25)'
      },
      {
        scope: 'Frontend',
        summary:
          'Notification and Follow-up Complete dialogs can now be dragged aside so users can inspect the patient screen without closing their work.',
        evidence:
          'Added a shared pointer-and-keyboard draggable modal directive, visible grip handles on both dialog title rows, viewport-bound movement, and Ionic modal content translation that leaves the backdrop fixed. Escape resets the dialog position and arrow keys provide accessible movement. Focused directive and modal Jest coverage passes 24/24 tests.',
        source: 'v4.0.0/followup-frontend session change (2026-08-25)'
      },
      {
        scope: 'Frontend',
        summary:
          'All active data-entry forms were audited for the discharge-save failure pattern; Facility and User Profile now target real invalid controls, and network forms preserve entries and block duplicate submissions.',
        evidence:
          'Removed the remaining DOM-only `ng-invalid` validation from Facility and User Profile, added exact field scrolling/focus, consolidated Facility and Patient multi-request saves so one final record PUT runs after prerequisites, and added retry-safe in-flight/error handling to Client edit, Post-it, Notification, Notification Detail reply, and Follow-up Complete. The live `<form>` inventory also confirmed login and patient call child forms were already safe or emit-only. Eight focused Jest suites pass 131/131 tests.',
        source: 'v4.0.0/followup-frontend session change (2026-08-25)'
      },
      {
        scope: 'Frontend',
        summary:
          'Patient discharge saves now identify and focus the exact invalid field, validate typed dates immediately, and preserve all entered data when the API cannot save.',
        evidence:
          'Made the reactive form the validation source of truth, synchronized visible date text with hidden controls on input, rejected impossible calendar dates and discharge-before-admit ranges, and changed the generic validation alert to name and focus the first invalid field. Patient PUT failures now leave the form mounted and show explicit retry guidance. Focused patient-form Jest coverage passes 42/42 tests.',
        source: 'v4.0.0/followup-frontend session change (2026-08-25)'
      },
      {
        scope: 'Performance',
        summary:
          'Patient and user avatars now populate progressively without keeping the full-page loading spinner active after patient or facility data is ready.',
        evidence:
          'Updated both avatar read services to set the existing `SKIP_GLOBAL_LOADER` HTTP context token on `GET /patients/{id}/avatar` and `GET /users/{id}/avatar`. Upload requests still use the global loader. Focused patient-avatar, user-avatar, and loader-interceptor Jest coverage passes.',
        source: 'v4.0.0/followup-frontend session change (2026-08-25)'
      },
      {
        scope: 'Release',
        summary: 'Promoted the frontend alpha candidate to version 4.0.6.',
        evidence:
          'Aligned package.json, package-lock.json, generated environment metadata, shell version assertions, and this Service Health manifest before promoting main into the alpha deployment branch.',
        source: 'v4.0.0/followup-frontend release stamp (2026-08-25)'
      }
    ]
  },
  {
    version: '4.0.5',
    recordedAt: '2026-08-17',
    label: 'Service Health manual-only + spinner/telemetry reliability fixes',
    notes:
      "Bundles this session's fixes; no prior running change log entry existed for this work before the release stamp.",
    entries: [
      {
        scope: 'Frontend',
        summary:
          'The Service Health panel no longer pops open automatically on a degraded or healthy status change; it now opens only when a user manually selects it from the Admin menu.',
        evidence:
          'Updated `syncServiceStatusVisibility()` in `src/app/shell/shell.component.ts` to drop the auto-open-on-degraded and 5-second auto-hide-on-healthy branches, and removed the now-dead production/manager auto-show suppression helpers. `shell.component.spec.ts` updated to assert the panel stays closed on any health transition unless pinned or manually opened.',
        source: 'v4.0.0/followup-frontend session change (2026-08-17)'
      },
      {
        scope: 'Frontend',
        summary:
          'The global loading spinner can no longer hang forever if a backend request never resolves; requests now time out after 30 seconds and always clear the spinner.',
        evidence:
          'Replaced the manual `Observable.create` wrapper in `src/app/shared/interceptors/loader-interceptor.ts` with `.pipe(timeout(30000), catchError(...), finalize(() => removeRequest(req)))`, guaranteeing cleanup on every terminal path (success/error/timeout/cancel). Added a fake-timers unit test proving a never-resolving request times out and clears `isLoading`.',
        source: 'v4.0.0/followup-frontend session change (2026-08-17)'
      },
      {
        scope: 'Frontend',
        summary:
          'The Service Health Version Change Log search now includes the 4.0.1-4.0.4 patch releases, which had been missing from the manifest.',
        evidence:
          'Added `4.0.1`, `4.0.2`, `4.0.3`, and `4.0.4` release entries to `service-health-change-log.data.ts`, reconstructed from git history since the running change logs were never updated for those hotfix releases.',
        source: 'v4.0.0/followup-frontend session change (2026-08-17)'
      },
      {
        scope: 'API',
        summary:
          'API telemetry now actually reaches Application Insights; it had been silently disabled in every environment because the `applicationinsights` package was never declared as a dependency.',
        evidence:
          "Added `applicationinsights` to `followup-api/package.json` dependencies and corrected the production `followupcare-api` App Service's `APPLICATIONINSIGHTS_CONNECTION_STRING` app setting, which had been pointed at a stale, unrelated App Insights resource. Confirmed via production log files that `[telemetry] Application Insights enabled for API runtime.` now prints on startup.",
        source: 'v4.0.0/followup-api session change (2026-08-17)'
      }
    ]
  },
  {
    version: '4.0.4',
    recordedAt: '2026-08-10',
    label: 'Version alignment stamp',
    notes:
      'Frontend- and API-only package/version bump with no functional change, promoting the 4.0.3 fix to the current released version. The frontend/API running change logs were not updated for this stamp, so this entry is reconstructed directly from git history (frontend `ccda744a`, API `413a076`).',
    entries: [
      {
        scope: 'Release',
        summary: 'Promoted the frontend and API package/version metadata to 4.0.4 with no additional code changes.',
        evidence:
          'git commit `ccda744a` (frontend) "Release 4.0.4" and `413a076` (API) "Release 4.0.4" touch only package.json/package-lock.json/.env.ts.',
        source: 'v4.0.0/followup-frontend git history + v4.0.0/followup-api git history'
      }
    ]
  },
  {
    version: '4.0.3',
    recordedAt: '2026-08-10',
    label: 'Notification modal type validation fix',
    notes:
      'The frontend/API running change logs were not updated for this hotfix, so this entry is reconstructed directly from git history (frontend `84a883a1`, API `6f4b798`).',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'The notification modal now blocks saving/sending while the notification type is unselected or recipients are still loading, instead of silently accepting an incomplete form.',
        evidence:
          'git commit `84a883a1` "Fix notify modal type validation and release 4.0.3" changed `src/app/shell/notification-modal/notification-modal.component.ts` to require a real `notificationTypeId` selection, added a `notificationRecipientsLoading` guard so double-submits are ignored mid-request, and marks all form controls touched to surface validation errors when the form is invalid.',
        source: 'v4.0.0/followup-frontend git history (commit 84a883a1)'
      }
    ]
  },
  {
    version: '4.0.2',
    recordedAt: '2026-08-10',
    label: 'Notification modal recipients fix',
    notes:
      'The frontend/API running change logs were not updated for this hotfix, so this entry is reconstructed directly from git history (frontend `12742aee`, API `4a7bb69`).',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Sending a notification from a nested patient route no longer silently drops the recipient list; the modal now resolves the operation id from the deepest active route and treats a missing/failed recipient lookup as an explicit error instead of leaving stale recipients in place.',
        evidence:
          'git commit `12742aee` "Fix notification modal recipients and release 4.0.2" reworked `src/app/shell/toolbar-nav/toolbar-nav.component.ts` to walk the full route snapshot tree (`getDeepestRouteSnapshot`/`getRoutePatient`/`getRouteParam`) instead of only checking the first-level child route, and updated `src/app/shell/notification-modal/notification-modal.component.ts` to reset `notificationRecipients` on every save attempt, surface toast errors when the operation id or recipient lookup fails, and block sending when no recipients are configured.',
        source: 'v4.0.0/followup-frontend git history (commit 12742aee)'
      }
    ]
  },
  {
    version: '4.0.1',
    recordedAt: '2026-08-10',
    label: 'Notification recipient cache-busting and email normalization',
    notes:
      'The frontend/API running change logs were not updated for this hotfix, so this entry is reconstructed directly from git history (frontend `f07be254`, API `bb290a9`).',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Notification recipient and operation contact reads now append a cache-busting query parameter so stale cached responses no longer mask newly configured recipients/contacts.',
        evidence:
          'git commit `f07be254` "chore: stamp 4.0.1 and refresh contact reads" updated `src/app/modules/notification/notification.service.ts` and `src/app/modules/operation/operation-contacts.service.ts` to append `HttpParams().set(\'_\', Date.now().toString())` to the recipient/contact GET requests.',
        source: 'v4.0.0/followup-frontend git history (commit f07be254)'
      },
      {
        scope: 'API',
        summary:
          'Outgoing notification emails now decode a URI-encoded notification message before sending, instead of emailing the raw encoded text.',
        evidence:
          'git commit `bb290a9` "chore: stamp 4.0.1 and normalize notification email" added `normalizeNotificationMessage()` to `deployment/clients/kicktechAPIService/kicktechAPIService.js`, which safely `decodeURIComponent`s the notification message before it is used in the outgoing email.',
        source: 'v4.0.0/followup-api git history (commit bb290a9)'
      }
    ]
  },
  {
    version: '4.0.0',
    recordedAt: '2026-08-09',
    label: 'Current 4.0.0 release',
    notes: 'Evidence comes from the v4.0.0 frontend and API markdown change logs and is kept in sync with them.',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'The notifications route now receives reply counts and resolved/unresolved status in the main operation-list payload, eliminating one `/notification/{id}/replies` request per row.',
        evidence:
          'Recorded in the snapshot frontend and API running change logs after updating `src/app/modules/notification/notification-listing/notification-patient-listing.component.ts`, the focused listing/service specs, `deployment/service/NotificationService.js`, and `migration_sql/3.12.15migration-notification-operation-reply-counts.sql`. The notifications page had been rendering the main list and then calling `/notification/{id}/replies` once per row just to derive resolved badges and reply counts, which created noisy audit traffic and kept extra loader work alive after the page was already visible. The main operation notifications response now carries `replyCount` plus a derived `notificationStatusLabel`, and the frontend list now relies on that payload directly instead of hydrating every row through a secondary reply read. Validation used focused Jest on the frontend notification service and listing specs plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md + v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The operation notifications list stored procedure is now reply-aware, returning `replyCount` and a derived resolved/unresolved label in one query.',
        evidence:
          'Recorded in the snapshot API running change log after adding `migration_sql/3.12.15migration-notification-operation-reply-counts.sql` and updating `deployment/service/NotificationService.js`. The legacy `sp_getNotificationsByNotificationOperationId` result set exposed only flat notification rows, so the frontend had no choice but to call the replies endpoint repeatedly to discover whether each row was effectively resolved. The replacement procedure left-joins `notificationReplies`, groups once per notification, returns `replyCount`, and derives `notificationStatusLabel` from `notificationResolved` plus reply presence so the operation listing can stay one-round-trip. Validation used alpha backup procedure inspection and `npm test --silent` PASS.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'History routes and patients outside the active `In Progress` follow-up state now gate the right-hand follow-up workflow, so users can still view history and leave notifications without reopening follow-up actions such as Start Follow-Up.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-detail/patient-detail.component.ts`, `.html`, `.scss`, the right-side follow-up control components under `src/app/modules/patient/patient-detail/patient-call`, `src/app/modules/patient/patient-detail/followup-complete-button/followup-complete-button.component.ts`, and the focused Jest specs for that slice. Completed patients had still been able to interact with the right-hand follow-up workflow after opening Patient Detail or the history view, and direct URL access could still reopen follow-up when a patient status was no longer `In Progress`. The detail view now treats history routes, non-`In Progress` statuses, completed (`patientGraduated`), or inactive patients as follow-up locked, shows an explanatory notice, visually deactivates the right-hand control area, disables the start/save/complete buttons plus status controls, and adds defensive no-op guards in the action handlers so notifications can still be left elsewhere without reopening follow-up on the patient. Validation used focused Jest on the patient-detail, start-button, status-controls, stop-button, next-call-finish-button, and followup-complete-button specs (`23/23` tests passing), plus the direct-route non-`In Progress` patient-detail spec (`16/16` tests passing), plus clean editor diagnostics on the touched files.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Archived patient history links now resolve inside the app instead of falling through to the login redirect, which also avoids the duplicate-account 409 detour for affected users.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-routing.module.ts` and adding `src/app/modules/patient/patient-routing.module.spec.ts`. The patient listing had already been sending archived or non-`In Progress` rows to `/call-queue/operations/:operationId/patient/:patientId/history`, but the router still only registered the live patient-detail path. Clicking those rows therefore fell through the global `** -> /login` route, which is why users could appear to be kicked out and then hit the duplicate-account `/users/login` `409` flow instead of seeing patient history. The frontend now registers the missing history route against `PatientDetailComponent` with the same `UserResolver` and `PatientResolver` contract as the live detail route. Validation used focused Jest on `src/app/modules/patient/patient-routing.module.spec.ts` (`1/1` tests passing) plus clean editor diagnostics on the touched route files.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Patient completion now fails fast with retry instead of hanging on completion-option loads, notification reply actions are wired again, and the patient facility picker hides archived facilities while normalizing the affected display names.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-status.service.ts`, `src/app/modules/patient/patient-detail/followup-complete-modal/followup-complete-modal.component.ts`, `src/app/modules/patient/patient-detail/followup-complete-modal/followup-complete-modal.component.html`, `src/app/modules/notification/notification-detail/notification-detail.component.ts`, `src/app/modules/notification/notification-listing/notification-patient-listing/notification-patient-listing.component.ts`, and `src/app/modules/patient/patient-form/patient-form.component.ts`. The completion modal no longer reuses a single never-settling status-label request forever: status-label reads now time out, retry cleanly, and expose a visible Retry action when the list cannot be loaded. The notification detail screen now reconnects the dead `Reply to Notification` CTA to the existing modal reply flow, and the operation notification list now hydrates replies so unresolved items with replies surface as `Resolved` immediately. The patient facility selector now filters archived facilities/clients out of active selection, preserves the currently selected archived facility on edit screens, and normalizes the affected labels to `Villages of ...` plus `Salt Lake` for the renamed South Salt Lake facility. Validation used focused Jest on the touched patient-status, completion-modal, notification-detail, notification-listing, and patient-form specs, plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Alpha IIS route rewrites now target `/index.html` explicitly, so deployed SPA routes such as `/login` resolve through the static Angular shell instead of failing at the site root rewrite path.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `web.config`. The hashed-assets beta rc1 alpha deployment left `alpha.followup.care/index.html` healthy and serving the current shell plus bundle references, but routed URLs like `/login` were still hitting a server runtime error because the IIS rewrite action targeted `/` instead of the static entry document. The deployed SPA rewrite now points directly at `/index.html`, keeping route rewrites aligned with the static Angular hosting model. Validation used `npm run "build alpha" -s` PASS, and the generated `dist/browser/web.config` now rewrites to `/index.html`.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Alpha frontend deployments now emit hashed asset filenames, which forces browsers to pick up the current runtime bundle instead of reusing a stale stable-name `main.js` cache entry.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `angular.json`. The live `alpha.followup.care` beta rc1 deployment had already succeeded at the App Service layer and the host was serving the new HTML shell plus beta bundle content, but browsers could still execute the prior `4.0.0_alpha_rc7(alpha)` runtime because the alpha build emitted stable asset names like `main.js` and `styles.css`. The alpha build configuration now sets `outputHashing: "all"`, so each deployment references hashed `main-*`, `polyfills-*`, and `styles-*` asset filenames instead of reusing the old cache path. Validation used `npm run "build alpha" -s` PASS, and the generated `dist/browser/index.html` now points at hashed asset filenames.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The patient Primary Diagnosis and Discharged Condition labels now sit a few pixels closer to their textarea inputs instead of inheriting the wider default stacked-label gap.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.scss`. Those two patient-form textarea rows were still using the normal stacked-label bottom margin, which left the labels a few pixels too high above the textarea fields relative to the intended spacing. The patient form now trims the `textarea-item` label bottom margin by about `3px`, bringing the labels closer without changing the surrounding layout. Validation used `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          "Shared radio, checkbox, and toggle labels no longer inherit Ionic's default in-item top margin, which keeps aligned labels from being pushed downward after the rc7 control-spacing refinements.",
        evidence:
          "Recorded in the snapshot frontend running change log after updating `src/theme/theme.scss`. Ionic's internal `:host(.in-item) .label-text-wrapper` rule was still adding a `10px` top margin to shared radio, checkbox, and toggle label wrappers, which reintroduced downward drift even after the local alignment passes. The theme now overrides the exposed label part for those controls so the top margin is cleared globally without patching `node_modules`, while the bottom spacing remains intact. Validation used `npm run build -s` PASS.",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Textarea inputs now share a slightly roomier vertical padding baseline, and the patient diagnosis/discharge notes no longer inherit the tighter single-line input feel.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/theme/theme.scss` and `src/app/modules/patient/patient-form/patient-form.component.scss`. The patient Primary Diagnosis and Discharged Condition textareas had been inheriting the tighter single-line field padding after the recent input-height refinement, which made their content sit too high compared with other textarea surfaces. The frontend now gives `ion-textarea` a shared `10px` vertical padding baseline at the theme layer and keeps the patient form aligned to that same spacing locally, so the patient diagnosis/discharge fields and other standard textarea inputs start with more top breathing room without changing their overall layout. Validation used `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          "The patient Birthday field now matches the page's inline Ionic date-picker contract, while the standard patient-form radio fill and date-input icon alignment are corrected locally.",
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.html`, `.ts`, `.scss`, and `.spec.ts`. The Birthday control had still been using the old browser `type="date"` path instead of the stabilized patient-form date contract, and the page\'s standard radios plus calendar-input affordances had drifted slightly in visual alignment. Birthday now uses the same typed `mm/dd/yyyy` input plus inline Ionic calendar pattern as Admit/Discharge, the patient-form radio fill is explicitly centered inside the control again, the gender row sits farther below Birthday, and the patient-form calendar icons are nudged slightly lower so the affordance reads centered in the input. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`36/36` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The patient add/edit form inputs now use a slightly shorter shared control height so the page reads less bulky while keeping the migrated styling consistent.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.scss`. The patient form had been using a slightly tall `44px` shared control baseline plus a taller Fluent Language select, which made the page feel heavier than intended. The current refinement reduces the shared control height a bit across the standard patient-form `ion-input` / `ion-select` / `ion-textarea` styling and mirrors that lower baseline through the custom facility picker trigger, the segmented phone inputs, and the typed admit/discharge date shell, while also shortening the taller Fluent Language select so the page stays visually uniform. Validation used `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          "Failed patient-form validation now scrolls to the top-most visible invalid field, and the page's standard radios and checkboxes share one consistent control size and label scale.",
        evidence:
          "Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.ts`, `.scss`, and `.spec.ts`. Failed patient saves now mark the form touched, resolve the earliest visible invalid field including the custom facility picker and admit/discharge date controls, and scroll that field into view before raising the validation alert. The same refinement standardizes the patient form's normal choice-control container size and label sizing so Gender, Responsible Party, Discharged To, Medical Condition, and Active render on the same baseline instead of mixing slightly different local overrides. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`33/33` tests passing) plus `npm run build -s` PASS.",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The patient form Admit/Discharge date controls now support both manual typed entry and an inline Ionic calendar option, while the page-level radios and checkboxes render with more consistent sizing and alignment.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.html`, `.ts`, `.scss`, and `.spec.ts`. The discharge section had been rendering `patientAdmitDate` and `patientDischargeDate` through a styled `ion-input type="date"` shell with a painted calendar affordance, which preserved the old look but did not reliably surface a working calendar picker after the Ionic migration. The final fix keeps manual typing available through visible `mm/dd/yyyy` text inputs, moves the Ionic calendar behind a dedicated calendar-icon button that opens a freshly mounted inline `ion-datetime` panel, keeps the existing reactive-form values and admit/discharge constraint calculations in sync, preserves validation through hidden bound controls, and normalizes typed slash-delimited dates into the internal ISO form on blur. The same pass also standardizes the patient-form radio and checkbox control sizing/alignment so Gender, Discharged To, and the other shared choice controls render with consistent box sizes and label alignment. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`33/33` tests passing) plus repeated `npm run build -s` PASS after the manual-entry and control-alignment refinements.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Performance',
        summary:
          "Initial Call Queue boot now reuses the authenticated user's hydrated operation context instead of issuing duplicate operation-detail reads for the selected facility.",
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/call-queue/call-queue.component.ts`, `src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.ts`, `src/app/modules/operation/operation.service.ts`, and the focused Jest specs for those slices. The traced queue load had been issuing redundant `GET /operations/{operationId}` reads from both the main Call Queue shell and the left sidebar even though login hydration already provides `user.operations` plus grouped `user.operationGroups[].operations` metadata with the counters and labels needed to identify the active facility. The queue now resolves the active operation from that authenticated user context first and falls back to the detail API only when the route targets an operation missing from hydrated user state, while the operation service also shares short-lived in-flight detail requests for any remaining concurrent callers. Validation used focused Jest on `src/app/modules/operation/operation.service.spec.ts` (`24/24` tests passing) plus `src/app/modules/call-queue/call-queue.component.spec.ts` and `src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.spec.ts` (`9/9` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The rc7 snapshot API dependency pass removes the optional App Insights runtime package, removes `file-type` from the download path, and trims the live audit surface down to three moderate legacy-router advisories.',
        evidence:
          'Recorded after updating `v4.0.0/followup-api/package.json`, `package-lock.json`, `deployment/index.js`, `deployment/telemetry.js`, and `deployment/utils/fileTransfers.js`. The API no longer ships `applicationinsights`, no longer depends on `file-type` / `read-chunk` to infer outgoing download MIME types, now uses top-level `js-yaml.load(...)` for local swagger parsing, and pins safer router transitives through `overrides` (`multer@1.4.5-lts.2`, `path-to-regexp@3.3.0`, `superagent@7.1.6`) while preserving the existing `oas3-tools.initializeMiddleware(...)` contract. Validation used `npm install`, a compatibility probe confirming `oas3-tools.initializeMiddleware` still exists and telemetry remains safely disabled when unconfigured, `npm test --silent` PASS (`8/8` tests), and `npm audit --json` reduced to `3` moderate findings, all remaining in the legacy `oas3-tools` -> `json-refs` -> `js-yaml` stack with no safe drop-in fix short of replacing that router subtree.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The rc7 snapshot frontend dependency pass moves the app to the latest Angular 21 patch line and the patched browser App Insights SDK, while leaving only force-level Angular build-tooling advisories behind.',
        evidence:
          'Recorded after updating `v4.0.0/followup-frontend/package.json` and `package-lock.json`. The frontend now runs on Angular runtime packages `21.2.17`, CLI/build packages `21.2.16`, and `@microsoft/applicationinsights-web@3.4.2`, followed by the safe `npm audit fix --legacy-peer-deps` pass available on that line. Validation used `npm install --legacy-peer-deps`, `npm run build -s` PASS before and after the safe audit-fix pass, and `npm audit --json`, which reduced the earlier `44` findings to `34` remaining vulnerabilities. Those remaining findings are concentrated in the Angular/build-tooling stack (`@angular-devkit/build-angular`, `@angular/build`, `@angular/compiler-cli`, `@angular/localize`, `@babel/core`, and `esbuild`) and would require a force-level or major-version toolchain move rather than another safe rc7 hotfix.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Non-production Wizard Bridge downloads now present as `data-alpha.xlsx` instead of inheriting the older dev or production filename path.',
        evidence:
          'Recorded after updating `v4.0.0/followup-api/deployment/controllers/Data.js`, `src/app/shell/toolbar-nav/toolbar-nav.component.ts`, and `src/app/shell/toolbar-nav/toolbar-nav.component.spec.ts`. The previous origin-aware workbook selector already routed localhost, alpha, and other non-production callers to the alpha workbook resource, but the visible filename contract still came through the old `data-dev.xlsx` lineage and could fall back to `data.xlsx` when the header path drifted. The API now serves non-production downloads as `data-alpha.xlsx` while still using the existing alpha workbook source asset, and the toolbar falls back to `data-alpha.xlsx` automatically on non-production hosts if `Content-Disposition` is missing. Validation used focused Jest on `src/app/shell/toolbar-nav/toolbar-nav.component.spec.ts` (`11/11` tests passing) plus snapshot API `npm test --silent` PASS (`8/8` tests).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Queue-facing patient and patient-call reads now enforce both facility active-state and parent client active-state, so archived facilities or archived clients no longer leak rows into Spanish queue listings or direct operation queue lookups.',
        evidence:
          'Recorded after updating `v4.0.0/followup-api/deployment/service/activeQueueScope.js`, `deployment/service/OperationService.js`, `deployment/service/PatientService.js`, and `deployment/service/PatientCallsService.js`, plus the matching client-edit fix in `src/app/modules/operation/operation-group-form/operation-group-form.component.ts`. The observed regression was that cross-facility queue reads such as `/patients/spanish` and `/spanish/calls` could still surface patients from archived facilities or from facilities under archived parent clients. The snapshot API now short-circuits operation-scoped queue reads when the operation or parent client is archived and post-filters Spanish queue stored-procedure rows against live `operations.operationActive` plus `operationGroups.operationGroupActive` before returning them. The client edit page also now resolves archived lifecycle state from the all-clients feed first so already archived clients correctly render the `Restore Client` action. Validation used focused Jest on `src/app/modules/operation/operation-group-form/operation-group-form.component.spec.ts` (`10/10` tests passing) plus snapshot API `npm test --silent` PASS (`8/8` tests).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The final Clients sidebar alignment pass pulls the `Active` / `Archived` label, count, and dropdown arrow into one tight right-edge cluster instead of leaving extra space before the arrow.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.scss`. The arrow had already been moved back to the far right, but there was still too much separation between the text/count cluster and the icon. The final spacing pass reduces the heading gap and trims the arrow margin so the entire heading reads as one flush right-aligned control. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` (`12/12` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The last Clients sidebar icon adjustment restores the dropdown arrow to the far right of the `Active` / `Archived` heading row while keeping the stronger final visual weight.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.scss`. The earlier icon cleanup removed the last local arrow override, but that also let the heading arrow fall into the wrong flex position. The final pass restores explicit right-side flex ordering and a slightly stronger `12px` footprint while keeping the shared arrow asset. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` (`12/12` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The final Clients sidebar icon pass removes the last local arrow override so the `Active` / `Archived` headings inherit the Call Queue dropdown icon treatment exactly.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.scss`. The prior polish had brought the Clients sidebar arrow closer to the reference sidebar, but it was still being shaped by a client-mode override instead of truly sharing the Call Queue arrow treatment. Removing that override lets the Clients sidebar headings inherit the same dropdown icon styling wholesale. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` (`12/12` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The final Clients sidebar polish tightens the stacked section spacing and brings the dropdown arrow back in line with the smaller Call Queue sidebar icon treatment.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.scss`. After the structural dropdown refactor, the Clients sidebar still felt slightly looser than the Call Queue reference because the stacked section spacing was a bit larger and the arrow was slightly oversized/offset. The section/list spacing is now tighter and the arrow is back to the smaller `10px` treatment with the familiar offset used in the reference sidebar. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` (`12/12` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Switching the Clients sidebar between `Active` and `Archived` no longer forces the detail panel to jump to a different client or visibly reload just to change the sidebar list.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.ts` and `.spec.ts`. The sidebar headings had already been restyled into stacked dropdowns, but changing filters was still auto-selecting the first client in the newly chosen section whenever the current selection belonged to the other section, which forced the client detail panel to blank/reload and caused a visible flicker. The sidebar now treats `Active` / `Archived` as a pure list filter change and leaves the current client detail stable until the user explicitly chooses another client. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` and `src/app/modules/operation/operation-listing/operation-listing.component.spec.ts` (`21/21` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Clients sidebar Active/Archived dropdowns now collapse when their currently open heading is clicked again instead of staying permanently open after the first load.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.ts` and `.spec.ts`. The stacked Clients sidebar headings already opened the correct list on first load, but clicking the currently open heading still no-oped because `setClientFilter(...)` returned immediately when the requested filter matched the active one. The sidebar now supports a real collapsed state by clearing `clientFilter` on same-heading clicks while still defaulting to `Active` on first load, and the focused sidebar spec now asserts that re-clicking the open heading collapses the visible client list. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` and `src/app/modules/operation/operation-listing/operation-listing.component.spec.ts` (`20/20` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Clients sidebar Active/Archived controls now behave like stacked Call Queue-style dropdown headings with arrows instead of inline filters, while client rows remain the smaller nested list layer.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.html`, `.ts`, and `.scss`. The first sidebar pass fixed the typography hierarchy, but the filter still read like a separate control instead of the Call Queue-style heading/list structure the app already uses elsewhere. The Clients sidebar now renders `Active` and `Archived` as separate bold heading rows with arrow affordances, reveals only the selected section list below each heading, keeps client names in the smaller nested list font treatment, and preserves the client-detail `Restore Client` action as the only restore path. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` and `src/app/modules/operation/operation-listing/operation-listing.component.spec.ts` (`19/19` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Clients sidebar now uses a clearer hierarchy: `Active` / `Archived` read as the bold heading layer, while client names render in the smaller list font used elsewhere in the Call Queue sidebar pattern.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.html` and `.scss`. The first Clients sidebar cleanup removed the redundant inline restore action and tightened the filter treatment, but the user-facing hierarchy still felt inverted because the filter labels were visually quieter than the client names. The sidebar now applies a client-mode class hook, the filter labels use bold uppercase heading typography, and client names render in the smaller `14px` list style while the selected client still keeps a stronger active-state emphasis. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` (`10/10` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Clients sidebar Active/Archived filters now follow the shared sidebar pill styling more closely, and archived clients are no longer restored directly from the sidebar itself.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.scss`, `.html`, `.ts`, and `.spec.ts`. The Clients sidebar still had a slightly different Active/Archived pill treatment than the other sidebars and exposed an extra inline `Restore` action beside archived client names even though the selected client panel already provides the canonical `Restore Client` button. The filter pills now use the same compact sizing pattern as the Teams sidebar, and the redundant sidebar restore path has been removed so restore happens only from the client-detail action area. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` and `src/app/modules/operation/operation-listing/operation-listing.component.spec.ts` (`19/19` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The homepage post-it note now gives the message body roughly 50% more space from the top of the sticky-note artwork before the copy begins.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/home/home.component.scss`. The sticky-note layout and scroll behavior were already stable, but the message copy was still starting slightly too close to the top edge of the note artwork. The note body top padding moved from `2.35rem` to `3.5rem`, which lowers the message start point without changing the note frame, sender alignment, or internal scroll handling. Validation used focused Jest on `src/app/home/home.component.spec.ts` (`4/4` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Admins can now use the standard Login as User flow directly from `/users/:userId`, and the `/users` roster no longer spends a full column on Role.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/user/user-profile/user-profile.component.ts`, `.html`, and `.spec.ts` plus the user-management roster slice in `src/app/modules/user/user-listing/user-listing.component.ts`, `.html`, and `.spec.ts`. The admin edit route now reuses the existing impersonation path already used elsewhere in the app, showing an admin-only `Login as User` action when viewing another user record and starting impersonation through `UserService.impersonateUser(...)` plus `AuthenticationService.startImpersonation(...)` before routing to `/home`. The `/users` listing also removes the redundant Role column from the visible roster and sort/filter column set so the table stays tighter around the actual management actions. Validation used focused Jest on `src/app/modules/user/user-profile/user-profile.component.spec.ts` and `src/app/modules/user/user-listing/user-listing.component.spec.ts` (`17/17` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Release',
        summary:
          'The current v4 beta snapshot is now tagged and surfaced as `4.0.0_beta_rc2` across the frontend build metadata, API package metadata, and the Service Health version history.',
        evidence:
          'Recorded after promoting both `v4.0.0/followup-frontend` and `v4.0.0/followup-api` package metadata from `4.0.0_beta_rc1` to `4.0.0_beta_rc2`, updating `package.json`, `package-lock.json`, `src/environments/.env.ts`, `src/app/shell/shell.component.spec.ts`, and retagging this top Service Health release entry so the active beta stamp shows up consistently in the shell version panel and API status payloads while the alpha branches and pipelines remain the deployment path.',
        source: 'v4.0.0/followup-frontend/agents.md + v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Resolved duplicate-account merges now disappear from the admin duplicate-review panel as soon as the API marks the source account deleted.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/user/user-listing/user-listing.component.ts` and `.spec.ts`. A successful `Run Merge Now` call had still been leaving the same pair flagged as a duplicate inside User Management because the merge result only patched a couple of in-memory rows and never rebuilt `duplicateGroups`, while the duplicate-group builder was still counting deleted users. The duplicate-account view now excludes deleted users from duplicate grouping and refreshes the duplicate groups/map immediately after a successful merge result so resolved pairs drop out of the panel without a manual refresh. Validation used focused Jest on `src/app/modules/user/user-listing/user-listing.component.spec.ts` (`7/7` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Duplicate-account merge preview and execute failures now surface the backend message directly instead of collapsing everything into one generic frontend error.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/user/user.service.ts`, `src/app/modules/user/user-listing/user-listing.component.ts`, and `src/app/modules/user/user-listing/user-listing.component.spec.ts`. The User Management debug panel had been converting merge API failures into the shared patient-service HTML wrapper and then discarding the original payload, which reduced every execute failure to `Unable to execute this merge workup.` even when the API already had a specific timeout or validation message. Merge preview and execute calls now preserve the raw backend error response and the user-listing component surfaces those specific API messages directly while keeping the existing fallback copy for truly empty errors. Validation used focused Jest on `src/app/modules/user/user-listing/user-listing.component.spec.ts` (`7/7` tests passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Duplicate-account merge execution now honors the long-running MSSQL timeout override end to end, and the shared API DB timeout default is raised to `45000ms` for slower queries app-wide.',
        evidence:
          'Recorded in the snapshot API running change log after updating `v4.0.0/followup-api/deployment/service/ConnectionPoolService.js` and `v4.0.0/followup-api/deployment/config/index.js`. The executable `/users/merge-script` path was still timing out at about `15000ms` even though `UserService` was already calling `pool.request({ requestTimeout: USER_MERGE_WORKUP_TIMEOUT_MS })`, because the DB profiling wrapper in `ConnectionPoolService` had replaced `pool.request()` with a no-argument shim that silently discarded request options before the driver saw them. The pool wrapper now forwards the original `pool.request(...)` arguments intact so per-request overrides like `USER_MERGE_WORKUP_TIMEOUT_MS` actually apply, and the shared API default `config.sql.requestTimeout` fallback is now `45000ms` instead of `15000ms` so slower non-merge queries get more headroom app-wide even without an explicit override. Validation used `node --check deployment/service/ConnectionPoolService.js` and `node --check deployment/config/index.js`.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The patient-detail discharge summary now expands and wraps long `Discharged To` labels plus the `(AMA)` flag instead of clipping them inside the fixed-height right-column summary box.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-detail/patient-notes/patient-notes.component.scss`. The visible clip in the patient call queue detail summary was not just the `Discharged To` row itself; the owning right-side discharge list (`.inline-discharge-section.right-column`) was still constrained by a fixed `75px`/`83px` column height, so longer discharge labels combined with the `(AMA)` flag were being cut off even after the inner row tried to grow. The discharge row now uses `height: auto` with the existing `60px` value preserved as a minimum height, explicitly allows normal wrapping, and the left/right discharge columns now use `height: auto` with the previous fixed heights preserved as minimums so the summary can expand naturally when discharge text runs long. Validation used focused Jest on `src/app/modules/patient/patient-detail/patient-notes/patient-notes.component.spec.ts` (`1/1` test passing) plus `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams landing page sidebar now matches the shared portal rail geometry, and the redundant selected-team `Team permissions` sidebar link has been removed.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-listing/team-listing.component.scss`, `src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.scss`, and `src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.html`. The `/teams` page wrapper had still been using a bespoke wider/offset geometry that made the entire left rail sit farther right and lower than the Patient and Clients sidebars, and the selected-team pane still exposed a redundant `Team permissions` action even though the main team content area already owns that entry point. The page now uses the shared sidebar width and portal offsets, right-aligns the sidebar internals to match the rest of the site, and removes the duplicate selected-team permissions link. Validation used focused Jest on the team-listing and team-sidebar slices (`9/9` and `5/5` tests passing) plus repeated `npm run build -s` PASS.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Anonymous visits to protected routes now stay inside Followup by redirecting to `/login` with a `returnUrl` instead of sending the browser back to the referring site.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/core/authentication/auth-guard.service.ts` and `src/app/core/authentication/auth-guard.service.spec.ts`. The auth guard had still been calling `Location.back()` for unauthenticated protected-route visits, which meant direct visits to `https://alpha.followup.care` from another site could bounce the browser straight back to the referrer instead of keeping the user inside Followup. The guard now performs an explicit in-app redirect to `/login` and preserves the requested route in `returnUrl` query params so protected deep links still have a stable post-login target. Validation used focused Jest on `src/app/core/authentication/auth-guard.service.spec.ts` (`3/3` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Archived patients now render as `Archived` in the patient listing and route directly to history instead of still appearing as `In Progress` links into the live call flow.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-listing/patient-patient-listing/patient-patient-listing.component.ts`, `.html`, and `.spec.ts`. The patient listing had been rendering the raw API `patientStatusLabel` even when `patientActive = 0`, so archived patients could still show `In Progress`, and the table row template was bypassing its own `getPatientLink(...)` helper with a hardcoded live patient route. The listing now normalizes inactive rows to display `Archived` before sort and search logic runs, and the row routerLink now uses `getPatientLink(patient)` so archived rows open the history view instead of the live call route. Validation used focused Jest on `src/app/modules/patient/patient-listing/patient-patient-listing/patient-patient-listing.component.spec.ts` (`9/9` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Notify modal now syncs the current form values before entering review mode, so the first Save shows the correct notification type and message instead of a blank or stale review state.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/shell/notification-modal/notification-modal.component.ts`, `.html`, and `.spec.ts`. The modal review step had been switching `status.notification.saved` before explicitly syncing the current form state back into the notification object, which could leave the first review pass missing the selected notification type metadata or current message content. The modal now uses one shared form-to-notification sync path before both `saveNotification()` and `sendTheNotification()`, and the no-recipient fallback link now points at the correct `notificationOperationId` route binding. Validation used focused Jest on `src/app/shell/notification-modal/notification-modal.component.spec.ts` (`7/7` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Duplicate-account merge execution now uses a real long-running stored-procedure timeout override instead of failing at the MSSQL driver default on larger account pairs.',
        evidence:
          'Recorded in the snapshot API running change log after updating `v4.0.0/followup-api/deployment/service/ConnectionPoolService.js` and `v4.0.0/followup-api/deployment/config/index.js`. The executable `/users/merge-script` path was still timing out at the driver default `15000ms` on larger duplicate-account pairs even though `UserService` was already calling `pool.request({ requestTimeout: USER_MERGE_WORKUP_TIMEOUT_MS })`, because the DB profiling wrapper in `ConnectionPoolService` had replaced `pool.request()` with a no-argument shim that silently discarded request options before the MSSQL driver saw them. The pool wrapper now forwards request arguments intact so the existing `USER_MERGE_WORKUP_TIMEOUT_MS` merge override actually applies, and the shared API `config.sql.requestTimeout` fallback is now `45000ms` instead of `15000ms` so slower non-merge queries get more headroom app-wide. Validation used `node --check` on the touched API files.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Patient Facility field now opens a reusable grouped searchable Ionic modal that preserves the current value until the user explicitly confirms the new selection.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.ts`, `src/app/modules/patient/patient-form/patient-form.component.html`, the reusable `src/app/shared/searchable-select-modal/*` component, and the related patient-form styles/tests. The old inline facility picker panel was removed in favor of a reusable modal that preselects the current facility, filters in real time through an `ion-searchbar`, keeps the form value unchanged until the user presses `OK`, preserves grouped client sections during search, and leaves the existing value untouched on `Cancel` or backdrop dismissal. Validation used focused Jest on `src/app/shared/searchable-select-modal/searchable-select-modal.component.spec.ts` and `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`32/32` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Primary Contact segmented phone fields now match the rest of the patient form inputs and the Responsible Party checkbox no longer collides with that phone row.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.html` and `src/app/modules/patient/patient-form/patient-form.component.scss`. The contact phone grid had still been using oversized `58px` inputs and kept the `Responsible Party` checkbox inside the same three-column grid, which made the segmented phone fields look taller and more boxy than the First Name / Last Name / Relationship inputs and let the checkbox sit too close to the phone row. The phone segments now use an explicit `44px` fixed height with tighter vertical padding so they cannot render taller than the surrounding text inputs, the horizontal segment spacing is normalized, the contact `Responsible Party` checkbox is rendered on its own row below the phone inputs, and the wrap breakpoint is narrowed so tablet widths keep the row intact while mobile widths still stack cleanly. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`28/28` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The duplicate-account admin panel can now execute the merge workup directly instead of only printing the stored procedure invocation.',
        evidence:
          'Recorded in the snapshot frontend/API running change logs after updating `src/app/modules/user/user-listing/user-listing.component.ts`, `src/app/modules/user/user-listing/user-listing.component.html`, `src/app/modules/user/user.service.ts`, `v4.0.0/followup-api/deployment/controllers/User.js`, `v4.0.0/followup-api/deployment/service/UserService.js`, and `v4.0.0/followup-api/deployment/api/swagger.yaml`. The admin-only duplicate-login panel in `/users` still supports previewing the `sp_runUserMergeWorkup` invocation, but it now also exposes `Run Merge Now`, which confirms the action, calls the same endpoint with `commitChanges = true`, and applies the committed final-user state back into the local roster. Validation used focused Jest on `src/app/modules/user/user-listing/user-listing.component.spec.ts` (`6/6` tests passing) plus `node --check` on the touched snapshot API controller/service files.',
        source: 'v4.0.0/followup-frontend/agents.md + v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team permissions now live in the team-facing manager/admin workflow: managers can open the team permissions screen from Teams, and the old Admin menu is renamed to Team Management.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-routing.module.ts`, `src/app/modules/team/team-listing/team-listing.component.ts`, `src/app/modules/team/team-listing/team-listing.component.html`, `src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.html`, `src/app/modules/team/team-access/team-access.component.html`, and `src/app/shell/toolbar-nav/toolbar-nav.component.ts`. The `teams/:teamId/access` route now allows managers alongside admins, the team page and sidebar relabel that path as `Team Permissions`, and the top navigation now presents the manager-visible section as `Team Management` with the primary child link renamed from `Team Members` to `Team Management`. Validation used focused Jest on the team-listing, team-access, and toolbar-nav slices (`26/26` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Managers can now open the user roster, edit another user profile, and keep the duplicate-account debug tooling admin-only instead of treating all user-management flows as admin-only.',
        evidence:
          'Recorded in the snapshot frontend/API running change logs after updating `src/app/modules/user/user-routing.module.ts`, `src/app/modules/user/user-profile/user-profile-routing.module.ts`, `src/app/modules/user/user-profile/user-profile.component.ts`, `src/app/modules/user/user-listing/user-listing.component.ts`, `src/app/modules/user/user-listing/user-listing.component.html`, `src/app/shell/toolbar-nav/toolbar-nav.component.ts`, `src/app/shell/toolbar-nav/toolbar-nav.component.html`, and `v4.0.0/followup-api/deployment/utils/routeAuthorization.js`. The frontend now allows manager access to `/users` and `/users/:userId`, keeps the duplicate-login debug panel admin-only inside the user roster, and exposes the `User Management` nav item to managers without opening the rest of the admin-only child links. The API authorization layer now explicitly treats `getUsers`, `getActiveUsers`, `getUserByUserId`, `editUserByUserId`, and user-avatar writes as manager-plus or self-service routes instead of leaving other-user edits behind an admin-only frontend gate. Validation used focused Jest on the user-profile, user-listing, toolbar-nav, and user-resolver slices (`25/25` tests passing) plus `node --check v4.0.0/followup-api/deployment/utils/routeAuthorization.js`.',
        source: 'v4.0.0/followup-frontend/agents.md + v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The patient form now shows only one patient-level `Responsible Party` toggle, while the Facility picker keeps grouped client headers and the contact phone row uses the same 44px field treatment as the rest of the form.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.ts`, `.html`, `.scss`, and `.spec.ts` plus the reusable searchable-select modal files. The patient HIPAA checkbox has been removed in favor of deriving the legacy compatibility field from the remaining responsible-party state, the grouped Facility modal preserves client sections and title-cased labels during search, and the segmented Primary Contact phone fields now use the same fixed 44px height and separate Responsible Party row as the rest of the migrated form. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` and `src/app/shared/searchable-select-modal/searchable-select-modal.component.spec.ts` (`32/32` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Add Patient toolbar entry now carries its own explicit manager-plus role gate instead of relying only on the broader Patient Portal dropdown visibility.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/shell/toolbar-nav/toolbar-nav.component.ts`, `.html`, and `.spec.ts`. The active v4 frontend already had manager-plus route protection on `/patients/add`, and the API already enforced `addPatient` as `adminOrManager`, but the toolbar dropdown still relied on the parent Patient Portal menu gate rather than expressing the Add Patient child-link rule directly. The toolbar now supports child-level role checks and marks `Add Patient` itself as manager-plus, so the UI contract stays explicit and remains correct even if the broader Patient Portal menu changes later. Validation used focused Jest on `src/app/shell/toolbar-nav/toolbar-nav.component.spec.ts` (`8/8` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Session timeout handling now separates the 15-minute frontend inactivity window from the bearer-token lifetime, and ordinary desktop clicks and wheel scrolling now count as real activity instead of being treated as idle time.',
        evidence:
          'Recorded in the snapshot frontend/API running change logs after updating `src/app/shell/shell.component.ts`, `src/app/shell/shell.component.spec.ts`, `src/app/modules/user/user-resolver.service.ts`, `v4.0.0/followup-api/deployment/service/UserAuthService.js`, and `v4.0.0/followup-api/deployment/service/UserService.js`. The frontend shell had only been extending its local inactivity deadline on mouse-move, touch, and keyboard activity, while the API was also embedding a hard `Date.now() + 900000` expiry into the JWT itself. That combination made active desktop users vulnerable to unexpected logout from click-only navigation or any workflow that crossed the 15-minute token age boundary. The shell now treats mouse-down and wheel activity as session activity, keeps the local inactivity window explicit at 15 minutes, and the API now issues an 8-hour JWT session window so active users are not forcibly logged out mid-workflow. Validation used focused frontend Jest on `src/app/shell/shell.component.spec.ts`, `src/app/core/authentication/auth.service.spec.ts`, and `src/app/core/http/error-handler.interceptor.spec.ts` (`18/18` tests passing) plus API `npm test --silent` (`Syntax OK for 69 files`).',
        source: 'v4.0.0/followup-frontend/agents.md + v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Notification detail access now follows the manager-plus `View / Reply` rule, and the Notify modal no longer closes or recreates duplicate notifications when the email-send step fails.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/notification/notification-routing.module.ts`, `src/app/modules/patient/patient-detail/patient-history-listing/patient-history-listing.component.ts`, `patient-history-listing.component.html`, and `src/app/shell/notification-modal/notification-modal.component.ts`. Notification detail navigation now uses the standard auth guard with manager-plus roles, patient-history reply hydration/rendering now follows the same gate instead of fetching reply content for care reps, and the Notify modal now preserves the created `notificationId` across retries, keeps the dialog open on send failures, and only dismisses after a successful send so retrying a failed email does not create duplicate notification records. Validation used focused Jest on the notification modal, patient history, notification detail, and auth guard slices (`4/4` suites, `20/20` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Patient contact phone row now follows the same grid alignment as the primary patient phone fields higher in the form.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.html` and `.scss`. The contact `US (+1)` / area code / phone-number controls were still using an older flex layout with narrower widths, which left them visually misaligned compared with the main patient phone row. The contact row now uses the same three-column grid sizing and shared label/input height treatment as the primary patient phone fields. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`24/24` tests passing), plus clean editor diagnostics on the touched template and stylesheet.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The New Patient facility selector now groups facilities under their client headings instead of presenting one flat cross-client list.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-form/patient-form.component.ts`, `.html`, and `.spec.ts`. The Patient form had been rendering a flat `ion-select` list from `user.operations`, which made the available facilities modal feel dislocated once the user had access to operations from multiple clients. The selector now derives grouped option sections from the existing visible `user.operationGroups` context, renders a disabled client header row for each group inside the Ionic select, and falls back to grouping by `operationGroupName` when the user snapshot lacks explicit group metadata. Validation used focused Jest on `src/app/modules/patient/patient-form/patient-form.component.spec.ts` (`23/23` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Clients portal `Date Added` column now uses the operation-created timestamp instead of `operationStartDate`, with fallback to the best available legacy date for older rows.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-listing/operation-operation-listing/operation-operation-listing.component.ts`, `.html`, `.spec.ts`, and `src/app/modules/operation/operation.ts`. The client/facility table had been labeling `operationStartDate` as `Date Added`, and its sort path was also comparing a date value against `operationActive`, so the displayed value and ordering could both be wrong. The listing now derives one added-date value per row by preferring `operationCreated`, then `operationEdited`, then `operationStartDate`, and it sorts by that same derived timestamp in both directions. Validation used focused Jest on `src/app/modules/operation/operation-listing/operation-operation-listing/operation-operation-listing.component.spec.ts` (`8/8` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Operation create/read timestamps are now part of the active alpha DB contract, so new facilities stamp created/edited time on insert and the client roster read proc returns those fields for the portal.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after adding `v4.0.0/followup-api/migration_sql/3.12.14migration-operation-created-edited.sql` and applying it to `followup_alpha_20260517`. The migration backfills legacy `operations.operationCreated` / `operationEdited` nulls, adds defaults for future direct inserts, updates `sp_addOperation` to stamp both timestamps with `[dbo].[getlocaldate]()`, and extends `sp_getOperationsByOperationGroupId` to return `operationCreated` / `operationEdited` alongside the existing client roster fields. Validation used the standardized no-exec wrapper, live alpha apply, post-apply null-count verification, a rollback-scoped `sp_addOperation` smoke, and a sample `sp_getOperationsByOperationGroupId` result showing the new fields.',
        source: 'v4.0.0/followup-api/agents.md + v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Operation form no longer writes its broader local client list back into the shared active-client cache when a user creates a new client inline, preventing archived or global-only clients from resurfacing later in otherwise filtered selectors and sidebars.',
        evidence:
          "Recorded in the snapshot frontend running change log after auditing the remaining client-group hydration paths and updating `src/app/modules/operation/operation-form/operation-form.component.ts`. After the ownership selector itself moved to the logged-in user's visible `user.operationGroups` context, the remaining leak was the inline `+ Add Client` modal in Operation Form: it was still copying the form's local `operationGroups` array back into `user.operationGroups`, `localStorage.operationGroups`, and the persisted user snapshot, even when that local list had been hydrated from the broader all-clients feed used by edit/view to preserve archived ownership display. The form now keeps the new client only in the local selector list and leaves the shared active-client cache untouched. Validation used focused Jest on `src/app/modules/operation/operation-form/operation-form.component.spec.ts`, `src/app/modules/data/data.service.spec.ts`, and `src/app/shell/toolbar-nav/toolbar-nav.component.spec.ts` (`40/40` tests passing).",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Notification create/send is now authenticated-user accessible while notification detail reads are restricted to manager-plus at the API authorization layer.',
        evidence:
          'Recorded in the snapshot API running change log after updating `deployment/utils/routeAuthorization.js` and `deployment/index.js` so `addNotification` and `sendNotificationByNotificationId` use an authenticated-user policy, while `getNotificationByNotificationId`, `getNotificationRepliesByNotificationId`, and `getNotificationRepliesByPatientId` require manager-plus. The authorization middleware now enforces operation policies generically instead of only treating them as write-only rules, which lets the API mirror the frontend `View / Reply` boundary without blocking care-rep initiated sends. Validation used `node --check deployment/index.js` and `node --check deployment/utils/routeAuthorization.js`.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Wizard Bridge downloads now default to the dev workbook for non-production origins instead of trusting a single server-side workbook filename for every caller.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after updating `v4.0.0/followup-api/deployment/controllers/Data.js` so `/data` resolves the workbook from request origin/host. Requests from `app.followup.care`, `www.app.followup.care`, and the live frontend host still resolve to the production workbook (`data.xlsx` or the configured prod override), while localhost, alpha, and other non-production callers now default to `data-dev.xlsx` with optional `WIZARD_BRIDGE_WORKBOOK_DEV` / `DATA_REPORT_FILE_NAME_DEV` overrides. The frontend download path was updated alongside this change so `src/app/modules/data/data.service.ts` now preserves the API response headers and `src/app/shell/toolbar-nav/toolbar-nav.component.ts` saves the workbook under the filename returned by `Content-Disposition` instead of always forcing `data.xlsx`. Validation used `node --check v4.0.0/followup-api/deployment/controllers/Data.js` plus focused Jest on the touched frontend download slice (`40/40` tests passing).',
        source: 'v4.0.0/followup-api/agents.md + v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The active client-groups API now excludes archived clients at the source, so `/operations/groups` no longer leaks archived alpha smoke clients into ownership selectors or other active-client consumers.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after updating `v4.0.0/followup-api/deployment/service/OperationService.js` so `getOperationGroups` capability-detects `operationGroups.operationGroupActive` and queries only active rows (`ISNULL(operationGroupActive, 1) = 1`) whenever the archive-state column exists, instead of trusting the legacy `sp_getOperationGroups` proc. Direct alpha-backed dev inspection on `followup_alpha_20260517` showed that proc still returned every operation-group row with no active filter, including archived smoke clients at ids `12`, `13`, and `16`; a direct local `NODE_ENV=dev` `OperationService.getOperationGroups()` probe after the fix returned only active groups and excluded those archived rows. Validation used `npm --prefix v4.0.0/followup-api test --silent` (`Syntax OK for 69 files`) plus the direct service probe against the alpha backup database.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'New Operation save now returns to the selected ownership client detail page instead of any legacy operations-group route, including the old `/operations/group/undefined` failure case when the placeholder operation record has no group id yet.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-form/operation-form.component.ts` so operation-save success now redirects from the submitted `operation.operationGroupId` form value through a shared helper instead of reading `this.operation.operationGroupId` from the pre-save placeholder object. That helper now routes to `/clients/:operationGroupId` for the fuller client view rather than the older `/operations/group/:operationGroupId` detail route, and it still avoids the prior undefined-group failure case by taking the submitted ownership client id from the form. Validation used focused Jest on `src/app/modules/operation/operation-form/operation-form.component.spec.ts` (`30/30` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Add New Operation now loads ownership choices from the active-only client feed, so archived clients are not selectable when creating a new facility.',
        evidence:
          "Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-form/operation-form.component.ts` so the form resolves its mode before loading ownership groups, skips stale cached `operationGroups` hydration entirely in add mode, and derives add-mode ownership choices from the logged-in user's visible `user.operationGroups` context rather than a global client-group feed. That keeps Ownership aligned with the Patient Facility picker: only active groups with at least one active visible operation remain selectable, which removes both archived rows and broader active noise such as Alpha Smoke clients or duplicate global entries that are outside the user-scoped visible context. Validation used focused Jest on `src/app/modules/operation/operation-form/operation-form.component.spec.ts` (`31/31` tests passing), and live browser verification confirmed the selector behavior.",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Restored clients now move back into the active Clients sidebar immediately without requiring a manual refresh on the client detail route.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-listing/operation-listing.component.ts` and `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.ts` so both restore entry points now emit the shared `notifyClientGroupsChanged()` signal and refresh the active user operation context through `updateOperations(...)`, matching the existing archive flow. Before this change, restoring a client could flip the detail-panel badge back to `Active` while leaving the sibling Clients sidebar on stale archived-state data until the page was refreshed. Validation used focused Jest on `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.spec.ts` and `src/app/modules/operation/operation-listing/operation-listing.component.spec.ts` (`20/20` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The grouped operation sidebars now share the same inside-list accordion behavior across Call Queue, Patients, Notifications, and Clients operations browsing.',
        evidence:
          'Recorded in the snapshot frontend running change log after reviewing the grouped sidebar family and updating `src/app/modules/notification/notification-listing/notification-listing-sidebar/notification-listing-sidebar.component.html`, `src/app/modules/patient/patient-manager-sidebar/patient-manager-sidebar.component.html`, and `src/app/modules/operation/operation-admin-sidebar/operation-admin-sidebar.component.html` to stop click bubbling from expanded `.group-operations` content and to keep operation-link clicks from retriggering parent accordion behavior. Call Queue had already been hardened first because its open list lived directly inside a clickable group wrapper; this follow-up normalizes the same guard across the other grouped operation sidebars so they behave under the same click conditions even when interacting inside an already expanded group. Validation used focused Jest on the Operation Admin, Notification sidebar, and Patient Manager sidebar slices (`17/17` tests passing) plus `npm run build -s`.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Client archive now also marks child facilities inactive in the snapshot API, so archived clients no longer leave technically active facility rows underneath them.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after updating `v4.0.0/followup-api/deployment/service/OperationService.js` so `deactivateOperationGroupByOperationGroupId` follows successful client archive with `UPDATE operations SET operationActive = 0 WHERE operationGroupId = @operationGroupId`, while still preserving the existing mixed-schema client-archive compatibility path if the child active-state column is absent. The frontend had already been hiding facilities under archived clients through filtered active operation-group context; this API change aligns the underlying facility active-state with that archived client status instead of relying on frontend filtering alone. Validation used the snapshot API syntax check (`npm test --silent`, `Syntax OK for 69 files`).',
        source: 'v4.0.0/followup-api/agents.md + v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Call Queue no longer collapses and re-expands the active facility accordion when the user clicks another operation inside the same already-open group.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.html` so clicks inside the open `.group-operations` list stop propagating back to the clickable facility-group wrapper. The accordion toggle had been attached to a parent wrapper that also contained the operation list, so selecting another operation in the same visible group retriggered the group toggle through bubbling and caused the left rail to collapse/reopen on each click. Validation used `npm run build -s`, which completed successfully after the template change; existing build warnings remained unchanged and were unrelated to this fix.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Call Queue now keeps the selected facility group expanded when the user switches operations, and sidebar operation links now show an underline affordance on hover across the shared sidebar family.',
        evidence:
          "Recorded in the snapshot frontend running change log after updating `src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.ts`, `call-queue-sidebar.component.spec.ts`, and `src/theme/theme.scss`. Call Queue selection now uses the same explicit `openOperationGroup(...)` behavior already used in the Patients and Notifications sidebars, so the selected operation's parent facility stays open while sibling facility groups collapse. The shared theme also now underlines `.operation-link` entries on hover/focus-visible so sidebar operation options provide a clearer movement affordance across Call Queue, Patients, Notifications, and Clients sidebars that reuse that class. Validation used focused Jest on `src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.spec.ts` (`6/6` tests passing).",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Archived clients are now removed from active facility contexts, so their facilities no longer appear in Call Queue and related left-side facility pickers after the client is archived.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation.service.ts`, `src/app/modules/user/user.service.ts`, and `src/app/core/authentication/auth.service.ts` so the active `operations/groups` feed is filtered to `operationGroupActive !== 0`, cached active operation-group snapshots are kept in sync, and user operation lists are pruned to facilities that still belong to active client groups during login and `updateOperations(...)` refreshes. This means a client archived from the Clients UI now removes its facilities from active queue/sidebar context on the next shared user-context refresh instead of leaving them visible in Call Queue, Notifications, and other operation-group-driven sidebars. Validation used focused Jest on `src/app/modules/operation/operation.service.spec.ts`, `src/app/modules/user/user.service.spec.ts`, and `src/app/core/authentication/auth.service.spec.ts` (`35/35` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Stop & Review in Patient Detail now returns the user to the top of the right-hand review pane automatically.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-detail/patient-detail.component.html`, `patient-detail.component.ts`, and `patient-detail.component.spec.ts` to add a review-pane top anchor and scroll to it when `patientCallEndEventHandler(...)` transitions the call into `In Review`. Before this change, users who clicked `Stop & Review` stayed scrolled at the bottom of the active-call form and had to manually scroll back up before they could review the call status, notes, and next-call or follow-up controls. Validation used focused Jest on `src/app/modules/patient/patient-detail/patient-detail.component.spec.ts` (`11/11` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Performance',
        summary:
          'Patient Detail now avoids duplicate question reads and unnecessary per-question answer fan-out when hydrating active-call and history question data.',
        evidence:
          "Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-detail/patient-call/patient-call-questions/patient-call-questions.service.ts`, `patient-call-questions.component.ts`, `patient-history-listing.component.ts`, and `patient-detail.component.ts`. The active-call question editor had been fetching the current call questions twice and then issuing per-question answer requests for the previous call, while the history panel eagerly loaded every call's questions plus every individual answer on initial render even for statuses that never display answers. The frontend now uses a cached shared `getPatientCallQuestionsWithAnswersByPatientCallId(...)` path, reuses root-scoped question services instead of local component instances, reuses the first current-call question read for the active editor, and only hydrates historical question answers for `Contacted` calls where the UI actually renders them. Validation used focused Jest on the patient-detail question/history slice (`4/4` suites, `27/27` tests passing).",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Operation form Ownership field now uses the same standard Ionic select pattern as the Patient Facility field instead of a custom lookahead overlay.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/operation/operation-form/operation-form.component.ts`, `.html`, `.scss`, and `.spec.ts` to remove the bespoke ownership trigger/overlay/typeahead path and restore a native `ion-select` for ownership-group selection. The earlier custom dropdown had diverged from the rest of the form UX and carried its own local overlay state and dead styling surface; the form now uses the standard Ionic selector while keeping the reactive form control and backing operation model synchronized through the existing select handler. Validation used focused Jest on `src/app/modules/operation/operation-form/operation-form.component.spec.ts` (`25/25` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Notify modal radio options now render unselected by default and only show the teal inner mark for the actually checked notification type.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/shell/notification-modal/notification-modal.component.scss` so the custom `ion-radio::part(mark)` teal fill is hidden by default and revealed only for `.radio-checked` / `aria-checked="true"`. The first teal restyle had already removed the broken transparent legacy skin, but because the custom mark styling was always visible every notification-type option looked selected on first render even though the form control itself was unset. This follow-up ties the visible teal dot back to the checked state. Validation used a clean static error pass on `src/app/shell/notification-modal/notification-modal.component.scss`.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Notify modal notification-type radios now use the same teal/dark-label form-control styling as the rest of the migrated UI instead of the broken transparent legacy radio skin.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/shell/notification-modal/notification-modal.component.scss` to remove the old pre-Ionic-8 `ion-radio` overrides that forced transparent checked colors and custom red-image radio art. Those legacy rules made checked choices appear to vanish or turn into white outlines and left labels looking washed out inside the modal. The modal now styles `.notification-choice` through `ion-radio::part(container|mark|label)` using the standard teal border/fill treatment, white radio background, and explicit dark AvenirPro label styling for stable contrast. Validation used a clean static error pass on `src/app/shell/notification-modal/notification-modal.component.scss`.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Notify modal now reliably swaps from its loading state to the loaded notification-type options as soon as `/notifications/types` returns inside the Ionic overlay.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/shell/notification-modal/notification-modal.component.ts` so the modal flips `notificationTypesLoading` directly inside the success/error handlers and forces a local change-detection pass after applying the new state. The request path had already been restored, but the overlay was still relying on the outer finalize path to settle the loading branch, which could leave the visible modal stuck on `Loading notification options...` even after the type array had arrived. The modal now clears that branch immediately when the data is normalized and applied. Validation used focused Jest on `src/app/shell/notification-modal/notification-modal.component.spec.ts`, `src/app/shell/toolbar-nav/toolbar-nav.component.spec.ts`, and `src/app/modules/notification/notification.service.spec.ts` (`3/3` suites, `25/25` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The toolbar `Notify` action now starts the notification-type fetch immediately when the modal is opened, instead of leaving the modal component to begin that read only after it starts rendering.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/shell/toolbar-nav/toolbar-nav.component.ts` to prewarm `NotificationService.getNotificationTypes()` before creating and presenting the Notify modal. The modal still performs its own `getNotificationTypes()` read during `ngOnInit`, but it now attaches to an already-started shared request or cached response rather than being the first place that triggers the network call after render. This shifts the start of `GET /notifications/types` onto the actual toolbar open action and trims avoidable delay from the visible modal load path. Validation used focused Jest on `src/app/shell/toolbar-nav/toolbar-nav.component.spec.ts`, `src/app/shell/notification-modal/notification-modal.component.spec.ts`, and `src/app/modules/notification/notification.service.spec.ts` (`3/3` suites, `25/25` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Notify modal notification-type loader now retries and recovers after a stalled or failed `/notifications/types` read instead of reusing one stuck shared request for the rest of the session.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/notification/notification.service.ts` so notification types are cached only after a successful response, while the in-flight request reference is cleared on completion/error and bounded by a timeout. The earlier modal performance optimization cached the raw shared observable itself; if the first type request hung, every later Notify modal open reused that same unresolved stream, stayed on `Loading notification options...`, and never issued a fresh network request. The loader now restores `retry(3)`, adds a bounded timeout, and memoizes only resolved type arrays, so later opens stay instant after a successful fetch but can retry cleanly after a stall or failure. Validation used focused Jest on `src/app/modules/notification/notification.service.spec.ts` and `src/app/shell/notification-modal/notification-modal.component.spec.ts` (`2/2` suites, `18/18` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Follow-up completion and Notification modals now reuse cached static option lists across opens instead of showing a fresh multi-second loading state every time.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/patient/patient-status.service.ts` and `src/app/modules/notification/notification.service.ts` to cache their static label/type GETs with `shareReplay(1)` and reset that cache on error, while also removing the modal-local service providers from `src/app/modules/patient/patient-detail/followup-complete-modal/followup-complete-modal.component.ts` and `src/app/shell/notification-modal/notification-modal.component.ts`. Those component-scoped providers had been forcing brand new service instances on each modal open, which discarded any reusable option state and guaranteed another round-trip; `retry(3)` on the list reads then stretched any slow/failing fetch into a visible 5-second spinner. Validation used focused Jest on the touched modal/service slice (`5/5` suites, `30/30` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Call Queue left sidebar now reflects the dedicated Spanish Speaking route instead of leaving another facility group looking active/open underneath it.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/call-queue/call-queue-sidebar/call-queue-sidebar.component.ts`, `.html`, and `.scss` so the sidebar reads route `mode: "spanish"`, clears any stale active operation in that mode, suppresses the normal default first-operation auto-open behavior, and highlights the `SPANISH` link itself through router-driven active styling. Before this fix, `/call-queue/spanish` had no `operationId`, but the sidebar still fell back to the first operation group and made the left rail look like a normal facility queue was selected even while the main panel was showing the cross-facility Spanish Speaking feed. Validation used focused Jest on the Call Queue sidebar/component slice (`2/2` suites, `7/7` tests passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams sidebar lifecycle actions now stack more tightly, so wrapped controls like `Rename` and `Archive` no longer show the extra vertical spacing inherited from the global button chrome.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.scss` to reduce wrapped action-row row-gap and reset `.team-lifecycle-action` away from the shared shell button dimensions (`height: auto`, `min-height: 0`, `padding: 0`, compact line-height). This keeps the same action order and behavior while removing the large vertical gap that appeared when the Teams sidebar lifecycle controls wrapped onto multiple lines. Validation used focused Jest on the Teams sidebar component slice (`5/5` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          "The Teams left sidebar now uses the same narrower sidebar measure as the other left rails, bringing its `TODAY'S DATE` block back into the same visual centering pattern.",
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.scss` to normalize the sidebar component width from `185px` back to the shared `172px` sidebar measure used across the rest of the app. The typography for the Teams calendar block already matched the other sidebars; the centering drift came from the broader internal sidebar column. Narrowing that component width realigns the date block without changing the Teams page content grid. Validation used focused Jest on the Teams sidebar component slice (`5/5` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The User Profile `Do any of the following apply to you?` checklist now matches the rest of the migrated app instead of rendering oversized checkbox boxes, oversized labels, and excessive checkbox-to-label spacing.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/user/user-profile/user-profile.component.scss` to remove the local `36px` checkbox container override, drop the extra host-level gap, tighten the checkbox container margin to `4px`, replace the oversized `18px` label styling with the compact Ionic checkbox pattern already used across the migrated UI (`--size: 22px`, compact row height, and `14px` AvenirPro label styling), and remove the profile-only width-cap plus `nowrap` combination that could cut off label text at the right edge. This keeps the existing two-column interest checklist layout intact while bringing both the checkbox control and its label spacing back into line with the other forms. Validation used focused Jest on `src/app/modules/user/user-profile/user-profile.component.spec.ts` (`7/7` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The editable Teams roster Position dropdown now resolves its selected option from the active team membership role instead of falling through to `Admin` when only the numeric role id is missing.',
        evidence:
          "Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-listing/team-members-listing/team-members-listing.component.ts` and `.html` so the roster dropdown prefers `teamMemberRoleLabelId`, falls back only to the same row's team-scoped `teamMemberRoleLabel`, and explicitly marks the matching option selected. This closes the remaining mismatch where the Teams left sidebar correctly grouped members under `Managers` while the editable roster dropdown still visually defaulted to `Admin`. Validation used focused Jest on the team-members listing slice (`10/10` passing).",
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Team Access sidebar now follows the active route team instead of defaulting to the first loaded team, removing a remaining mismatch between the left rail and the team access content panel.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-access/team-access.component.ts` and `.html` to pass the active `team` into `app-team-listing-sidebar`, pass through admin capability, and navigate to `/teams/:teamId/access` when the sidebar selects a different team. Before this fix, the Team Access sidebar could initialize independently against the first team returned by `getTeams()`, which made the left-rail grouping look wrong even after the active-team role derivation fixes had landed. Validation used focused Jest on the Team Access slice (`10/10` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          "Team Access and Teams sidebar role-derived UI now prefer the active team's stored membership role before any broader effective label fallback.",
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-access/team-access.component.ts` and `src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.ts`. The remaining `ion-select`-driven assignee eligibility lists and sidebar member grouping had still been reading `teamMemberRoleLabel` text, which could reflect a broader role story than the active team-specific membership role. Those paths now derive from `teamMemberRoleLabelId` first and only fall back to the scoped effective role id when no stored team role exists. Validation used focused Jest on the Team Access and Teams sidebar slices (`14/14` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The editable Teams Position dropdown now binds only to the stored team-specific role and no longer silently displays `Admin` from broader derived access or from a blank select default.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-listing/team-members-listing/team-members-listing.component.ts` and `.html`. The admin Position select previously fell back to `effectiveTeamMemberRoleLabelId` and inferred labels, and because the control had no blank placeholder it could also silently render the first option `Admin` when no stored team-specific role was present. The editable dropdown now uses only `teamMemberRoleLabelId` and includes a disabled blank option so the visible selection stays aligned with the stored membership role for the active team. Validation used the focused team-members-listing Jest slice (`9/9` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Teams roster Position reads now derive fallback/effective roles from the selected team scope instead of leaking a stronger direct role from some other team.',
        evidence:
          "Recorded in the snapshot API/frontend running change logs after tightening `v4.0.0/followup-api/migration_sql/3.12.12migration-team-member-general-role.sql` and reapplying it to `followup_alpha_20260517`. The first stored-procedure cut still treated `operationUsers` as globally authoritative during null-role backfill and `sp_getTeamMembersByTeamId` effective-role derivation, which allowed a stronger direct role from unrelated operations to make the current team roster still display `Admin` after a successful team-role update. The migration now scopes direct-role candidates to the selected team's operation set before deriving fallback/effective team roles. Validation used direct `sqlcmd -b -i` reapply plus before/after mismatch probes, where a live `storedRoleId = 2 / effectiveRoleId = 1` mismatch disappeared under the corrected team-scoped derivation.",
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'The team general-role database contract is now applied on the active alpha database behind local dev, so Teams Position changes can persist instead of failing on a missing column/proc.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after applying `v4.0.0/followup-api/migration_sql/3.12.12migration-team-member-general-role.sql` to `followup_alpha_20260517`. The first apply exposed that this database compatibility level rejected bare `THROW` inside `sp_setTeamMemberRoleByTeamIdAndTeamMemberId`, so the migration catch block was corrected to `RAISERROR(ERROR_MESSAGE(), ERROR_SEVERITY(), ERROR_STATE())` and then reapplied cleanly. Post-apply capability probes confirmed `userTeams.teamMemberRoleLabelId`, `sp_setTeamMemberRoleByTeamIdAndTeamMemberId`, and the refreshed `sp_getTeamMembersByTeamId` are now present on the database used by localhost API runs.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Team-role downgrades now stop for confirmation when stronger direct operation permissions would need to be removed, instead of silently leaving higher effective access behind.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/controllers/Team.js, deployment/service/TeamService.js, and deployment/api/swagger.yaml. The team-role route now detects stronger direct `operationUsers` rows within the selected team scope, returns a structured `409` conflict with impacted-count preview data, and only removes those direct rows when the caller explicitly retries with `forceDirectPermissionCleanup`. Validation used `npm test --silent` (`Syntax OK for 69 files`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams roster Position editor now warns before a downgrade strips stronger direct permissions and only retries the change after explicit confirmation.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating the Team service and team-members-listing component/specs so structured `409` downgrade conflicts are preserved, surfaced as a confirmation dialog with impacted-count context, and retried with `forceDirectPermissionCleanup` only when the admin confirms. Validation used the focused Teams Jest slice (`24/24` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams roster Position dropdown now emits the live membership-role update request reliably instead of stopping at a visually changed select state.',
        evidence:
          'Recorded in the snapshot frontend running change log after replacing the roster Position cell control in src/app/modules/team/team-listing/team-members-listing/team-members-listing.component.html with a native `<select>` styled in the companion SCSS and covered by a DOM-level Jest regression. The earlier `ion-select` continued to look interactive without reliably driving the existing `PUT /teams/{teamId}/members/{teamMemberId}/role` request path in the live UI, so the roster now uses a direct browser `change` event into the existing component/service update flow. Validation used the focused Teams Jest slice (`21/21` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          "Changing a team member's Position from the Teams roster now propagates into the actual Team Access permission matrix instead of only storing a display role on the membership row.",
        evidence:
          "Recorded in the snapshot API running change log after updating deployment/controllers/Team.js, deployment/service/TeamService.js, and migration_sql/3.12.12migration-team-member-general-role.sql. The earlier role route only wrote `userTeams.teamMemberRoleLabelId`; it now also rewrites that member's `teamMemberOperationOverrides` across the current team access scope so effective permissions follow the selected team role. The canonical SQL source was widened at the same time so Team Access constraints and write procedures accept `Admin` (`1`) alongside `Manager` and `Care Rep`. Validation used `npm test --silent` (`Syntax OK for 69 files`).",
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams roster Position dropdown and the Team Access editor now describe the same role space, including `Admin`, so membership-role changes no longer stop at a UI label.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating src/app/modules/team/team-access/team-access.component.ts and its focused Jest coverage to include `Admin` as a valid Team Access default/member-override role, aligned with the backend propagation fix for `PUT /teams/{teamId}/members/{teamMemberId}/role`. Validation used the focused Teams Jest slice covering the roster editor, Team service contract, and Team Access component (`20/20` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Team memberships now support a persisted team-specific general role on `userTeams`, with a focused write procedure for the Teams roster dropdown instead of relying only on the old derived highest-role label.',
        evidence:
          'Recorded in the snapshot API running change log after adding `v4.0.0/followup-api/migration_sql/3.12.12migration-team-member-general-role.sql`, wiring it into the migration manifest and alpha compile wrapper, and introducing `userTeams.teamMemberRoleLabelId` plus `sp_setTeamMemberRoleByTeamIdAndTeamMemberId`. The migration also backfills existing memberships from the prior computed highest-role behavior so the first roster render stays aligned with current data before admins begin choosing team-specific overrides. Validation used the snapshot API syntax test path and the new migration is now part of the canonical ordered SQL chain.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The API now exposes `PUT /teams/{teamId}/members/{teamMemberId}/role`, and team-member roster/detail reads surface the selected team-specific role while preserving mixed-schema fallback behavior.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/controllers/Team.js, deployment/service/TeamService.js, and deployment/api/swagger.yaml. The service now supports the focused role-update route for the Teams members table, enriches team-member reads with the stored team role when present, and keeps the prior derived-role value available as a fallback so older schemas or pre-migration reads do not collapse to blank role labels during rollout. Validation used `npm test --silent` (`Syntax OK for 69 files`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Teams admins can now choose each member’s team-specific general/highest role directly from the roster table through an inline Position dropdown.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating src/app/modules/team/team-listing/team-members-listing so the static `Position` label becomes an admin-only dropdown backed by `PUT /teams/{teamId}/members/{teamMemberId}/role`. The table now keeps team role selection local to the selected team, updates the roster in place after save, and preserves the existing read-only label for non-admins. Validation used the focused team-members-listing and team.service Jest slice (`12/12` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Team-member removal now matches the canonical member-detail route: Swagger exposes `DELETE /teams/{teamId}/members/{teamMemberId}` and the backend resolves that team member id back to the underlying user before delete.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after adding the missing delete operation to deployment/api/swagger.yaml and aligning the frontend remove call to use `teamMemberId` instead of treating the member-detail route segment like a raw user id. The remove action had been hitting the existing member-detail path shape all along, but Swagger only defined `GET` there, which caused oas3-tools to reject the request with `405` before the controller ran. TeamService on the API side now resolves `userTeams.userTeamId` to the correct `userId` before invoking the existing remove proc/table path. Validation used direct swagger parsing, API syntax tests, and the focused team-members-listing Jest slice.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Teams admins can now remove users directly from the team roster on the Teams page, alongside the new searchable add-member picker.',
        evidence:
          'Recorded in the snapshot frontend running change log after wiring team-member removal into src/app/modules/team/team.service.ts and adding a row-level admin remove action in src/app/modules/team/team-listing/team-members-listing. Each roster row now exposes a confirmed remove action that reloads the member list and team count after success, and the remove path now uses the canonical `teamMemberId` member-detail route shape rather than treating the route segment like a raw `userId`. Validation used the focused team-members-listing Jest slice with explicit remove-member coverage.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams page now has an admin-only searchable add-member picker that loads active system users, filters out existing team members, and adds a selected user directly into the current team roster.',
        evidence:
          'Recorded in the snapshot frontend running change log after wiring `POST /teams/{teamId}/members` into src/app/modules/team/team.service.ts and adding an `+ Add Member` modal-style picker to src/app/modules/team/team-listing/team-members-listing. The picker is backed by `UserService.getActiveUsers()`, supports typeahead filtering by name/email/username/role, shows a scrollable result list, excludes users already on the selected team, and reloads the members roster after a successful add so the Team page count updates immediately. Validation used the focused team-members-listing Jest slice with explicit picker and add-member coverage.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Archived teams can now be restored cleanly from the Teams sidebar; restore switches back to the active view so the restored team stays visible instead of disappearing from the current archived filter.',
        evidence:
          'Recorded in the snapshot frontend running change log after tightening src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.ts. The restore action already existed, but once `teamActive` flipped back to `1` it could leave the user parked on the Archived filter, which made the restored team vanish from the current list and made unarchive feel incomplete. Restore now confirms intent, switches the sidebar back to Active, reselects the restored team, and reloads the roster. Validation used the focused Teams sidebar Jest slice with explicit restore coverage.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Alpha and prod now have the missing team lifecycle database foundation (`teams.teamActive`, `sp_addTeam`, `sp_editTeamByTeamId`, `sp_getTeamByTeamId`, and a refreshed `sp_getTeams`), removing the 400 team create/rename/archive path that left the Teams sidebar stale.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after adding and applying `v4.0.0/followup-api/migration_sql/3.12.11migration-team-lifecycle-foundation.sql` to both `followup_alpha_20260517` and `followup`. Before the migration, the affected schemas still exposed `dbo.teams` with only `teamId` and `teamName`, `sp_getTeams` returned no active-state metadata, and `sp_addTeam`, `sp_editTeamByTeamId`, and `sp_getTeamByTeamId` were absent, which is why team lifecycle requests could fail with `Could not find stored procedure` errors even when the frontend request itself was correct. The migration backfills `teams.teamActive`, recreates the missing lifecycle procedures, and updates `sp_getTeams` to include `teamActive`. Validation used `sqlcmd -b -i validate-all-alpha.noexec.sql`, alpha apply, rollback-scoped alpha SQL smoke for `sp_editTeamByTeamId` + `sp_getTeamByTeamId` + `sp_getTeams`, a local TeamService smoke plus explicit restore of the test team state, prod apply, and final capability verification showing `1 1 1 1` for add proc / edit proc / get-team proc / teamActive column in both databases.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Team rename, archive, and restore flows now fall back to direct `dbo.teams` updates when `sp_editTeamByTeamId` is missing instead of failing with a 400 at the API layer.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/service/TeamService.js to detect whether `sp_editTeamByTeamId` and `teams.teamActive` exist before writing team changes. The prior team flows still assumed the shared edit proc existed after the `teamActive` binding fix, so requests like `PUT /teams/{teamId}` and `DELETE /teams/{teamId}` could still fail with `Could not find stored procedure \`sp_editTeamByTeamId\`.` on mixed schemas even though direct table writes were possible. The service now uses the proc when present and otherwise falls back to direct `dbo.teams` updates, only rejecting archive-state writes when the schema also lacks `teamActive`. Validation used API syntax tests (`npm test --silent`) and clean editor diagnostics on deployment/service/TeamService.js.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Duplicate-account merge workups now run through `dbo.sp_runUserMergeWorkup` on both alpha and prod instead of exposing a full inline SQL transaction script from the API.',
        evidence:
          'Recorded in the snapshot API running change log after adding migration `v4.0.0/followup-api/migration_sql/3.12.10migration-user-merge-workup-procedure.sql`, compile-validating the standardized migration chain on alpha, applying the new procedure to `followup_alpha_20260517` and `followup`, and verifying the object exists in both databases. The alpha rollback-preview smoke for the real `58 -> 19` `bneff@hgmgt.com -> bneff` pair also exposed and then validated a unique-index deduplication hardening on `dbo.operationUsers`, so the final proc now pre-deletes source rows that would collide with target unique keys before FK reassignment.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The duplicate-account merge panel now presents `/users/merge-script` output as a stored-procedure workup instead of a raw SQL block.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating src/app/modules/user/user-listing/user-listing.component.html copy to describe the merge output as a stored procedure invocation. This matches the API/backend contract change where `/users/merge-script` now returns a rollback-first `EXEC dbo.sp_runUserMergeWorkup ... @commitChanges = 0` snippet for admin review. Validation used the focused user-listing Jest spec (`4/4` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Team creation now works on mixed schemas where `sp_addTeam` is absent; the API falls back to inserting directly into `dbo.teams` and still returns a normalized created-team payload.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/service/TeamService.js `addTeam` to detect whether `sp_addTeam` and `teams.teamActive` exist before creating a team. The previous `POST /teams` path failed with `Could not find stored procedure \`sp_addTeam\`.` and the frontend appeared to do nothing because the Teams sidebar refresh only runs after a successful response. The service now uses the proc when present and otherwise inserts directly into `dbo.teams` with schema-aware handling for the optional `teamActive` column. Validation used `node --check deployment/service/TeamService.js` and API syntax tests (`npm test --silent`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          "The Teams sidebar `TODAY'S DATE` block now sits on the same column width as the other major sidebars instead of rendering inside a wider Teams column.",
        evidence:
          'Recorded in the snapshot frontend running change log after narrowing the Teams sidebar column in src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.scss to the same effective width used by the call queue, notifications, users, and operations sidebars. The typography values were already aligned; the inconsistency was the wider Teams column causing the date composition to render on a broader measure than the rest of the app. Validation used the focused Teams sidebar Jest spec (`3/3` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Team create, rename, restore, and archive flows now reach the shared team edit stored procedure again; the API no longer rejects numeric `teamActive` values as invalid strings.',
        evidence:
          'Recorded in the snapshot API running change log after fixing deployment/service/TeamService.js so all `sp_editTeamByTeamId` callers normalize `teamActive` to `0` or `1` and bind it as `sql.Int` instead of `sql.VarChar`. The previous binding caused `Validation failed for parameter \`teamActive\`. Invalid string.` during team create, rename/edit, restore, and archive follow-up flows before the procedure ran, which left the Teams widget unchanged because the sidebar reload path only executes after a successful response. The service now returns a stable edited-team payload for the direct edit path as well. Validation used `node --check deployment/service/TeamService.js` and API syntax tests (`npm test --silent`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Teams sidebar no longer renders an `Other` member bucket; it now shows only Admins, Managers, and Care Reps.',
        evidence:
          'Recorded in the snapshot frontend running change log after narrowing the visible Teams sidebar role-group list in src/app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component.ts to `admins`, `managers`, and `careReps`. Focused sidebar Jest coverage also confirms that `createTeam()` still invokes the frontend team service after prompt confirmation, so the create click path remains live while the API-side teamActive binding fix restores the backend write. Validation used the focused team-listing-sidebar Jest spec (`3/3` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Post A Note modal recipient choices now render as stable single-selection controls again instead of overlapping/broken icons.',
        evidence:
          'Recorded in the snapshot frontend running change log after replacing the legacy custom-skinned `ion-radio` recipient controls in src/app/shell/post-it-modal/post-it-modal.component with native radio inputs bound to the existing reactive form state. The prior markup depended on pre-Ionic-8 radio styling and could show duplicated or malformed outlines beside `To: <team member>` and `To: Dashboard Message`. The modal now uses stable native inputs with the existing checked/unchecked art assets, defaults to the direct-user selection, and keeps the surrounding textarea/button spacing responsive. Validation used the focused Post A Note Jest spec (`2/2` passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Authenticated users can delete newly added cork-board images again; the owner-authorization lookup no longer fails when the cork-board proc omits a direct `userId` field.',
        evidence:
          'Recorded in the snapshot API running change log after hardening deployment/utils/routeAuthorization.js resolveCorkBoardOwnerUserId. The previous admin-or-self guard only read `response[0].userId` from `sp_getUserCorkBoardObjectByUserCorkBoardObjectId`, which could leave delete requests for newly added cork-board images failing early with `Target user id is required.` when the proc response only included the stored upload-path record. The resolver now checks several owner-id aliases and falls back to the persisted upload filename pattern (`<timestamp>-<encodedUserId>-corkboard-object-...`) to recover the owning user for authorization before delete. Validation used `node --check deployment/utils/routeAuthorization.js` and API syntax tests (`npm test --silent`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Alpha now has the previously missing migration set (`3.12.4`, `3.12.8`, `3.12.9`) applied, including mixed-schema compatibility updates for Team Access defaults and direct-permission cutover procedures.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after applying the pending scripts on `followup_alpha_20260517` and patching migration compatibility where alpha schema drift existed. `3.12.8` was updated to validate default assignee ids via `userTeams.userTeamId` (instead of `teamMemberId`), and `3.12.9` was updated to avoid hard dependencies on optional columns (`operationUsers.operationUserId`, `users.userLevel`, `teams.teamActive`) while preserving cutover/restore procedure creation. Post-apply verification confirms `3.12.8` and `3.12.9` signatures are present and `sp_getAssignedUsersByOperationId` includes deleted-user filtering for the `3.12.4` intent.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Client archive and restore now detect whether the database can actually support soft-archive before writing, instead of falling through to a blank generic route error on legacy schemas.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after updating deployment/service/OperationService.js so the `DELETE /operations/groups/{operationGroupId}` and restore paths capability-detect both the stored procedures and `operationGroups.operationGroupActive` before deciding whether to execute the proc or the direct-update fallback. The previous mixed-schema fix only handled a missing deactivate/restore proc and still failed generically on databases where the active-state column itself was absent. The API now preserves the direct `UPDATE operationGroups SET operationGroupActive = ...` fallback when the column exists and returns a clear unsupported-schema message when soft archive/restore requires the missing column migration. Validation used `node --check deployment/service/OperationService.js` plus API syntax tests (`npm test --silent`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'The local alpha backup database now has `operationGroups.operationGroupActive` deployed, so snapshot client archive and restore can complete through the existing direct-update fallback path.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after adding `v4.0.0/followup-api/migration_sql/3.12.13migration-operation-group-active.sql`, wiring it into `migration_sql/README.md` and `migration_sql/validate-all-alpha.noexec.sql`, and applying it to `followup_alpha_20260517`. Before this rollout, the snapshot API correctly reported soft archive unsupported because the alpha backup database had neither the archive procedures nor the `operationGroups.operationGroupActive` column. The additive migration backfilled all existing operation groups to active, made the column non-null with default `1`, compile-validated cleanly through the standardized no-exec wrapper, and was then verified with a local `NODE_ENV=dev` `OperationService` round-trip where `operationGroupId=1` archived to `0` and restored to `1` with both service calls returning success.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Client archive requests now succeed on mixed schemas where `sp_deactivateOperationGroupByOperationGroupId` is missing, using a safe direct-update fallback.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after updating OperationService.deactivateOperationGroupByOperationGroupId to fall back to `UPDATE operationGroups SET operationGroupActive = 0` when the deactivate stored procedure is unavailable. This resolves the 400 path on `DELETE /operations/groups/{operationGroupId}` that previously surfaced as `Could not find stored procedure ...` in audit/perf logs and blocked archive from the Edit Client screen. Validation used API syntax tests (`npm test --silent`).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Clients operation-group detail endpoint now returns row arrays instead of a recordset wrapper, resolving the persistent single-row roster symptom in `/clients/:operationGroupId`.',
        evidence:
          'Recorded in the snapshot API/frontend running change logs after fixing OperationService.getOperationsByOperationGroupId to use `results.recordsets[0]` (rows) instead of `results.recordsets` (array of recordsets). The previous shape mismatch could surface in the frontend table as one top-level item regardless of actual operation count. Validation used API syntax tests (`npm test --silent`) plus focused frontend operation listing Jest coverage.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Clients detail hydration now ignores duplicate/empty route emissions and stale async responses so rapid navigation cannot overwrite the selected client roster.',
        evidence:
          'Recorded in the snapshot frontend running change log after adding second-pass guards in operation-listing.component.ts and operation-admin-sidebar.component.ts: transient empty client-route group ids are ignored when a selection already exists, duplicate in-flight hydrations are suppressed per group id, stale asynchronous hydration responses are dropped unless they match the latest request and current selection, same-group sidebar reselection emits are short-circuited, and client filter state auto-aligns so routed archived selections remain visible. This prevents post-hydration row collapse caused by out-of-order responses during route reuse and rapid group switches. Validation used focused operation sidebar/listing Jest suites (21/21 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Clients detail table no longer collapses from hydrated multi-row results to a smaller user-scoped fallback set after initial load.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating operation-operation-listing.component.ts to keep strict client-mode data flow (`section === clients`) and avoid init-time fallback to `user.operations` while client-group hydration is in flight.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team Access member-exceptions left-side alignment was tightened so member selection and row layout no longer appear loose or jagged.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating src/app/modules/team/team-access/team-access.component.scss to standardize member picker button grid alignment and strengthen member-exception row column structure on the Team Access edit surface.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team Member detail styling regression was corrected by restoring a coherent profile-grid stylesheet and component structure, bringing back Follow-up visual treatment.',
        evidence:
          'Recorded in the snapshot frontend running change log after repairing src/app/modules/team/team-detail/team-detail.component.scss and .html to remove a broken mixed-style state that caused default/raw rendering. The member page now renders as a stable two-column profile layout with styled action row, greeting/name hierarchy, and full ACCESS chip/list treatment; source detail text was also normalized in team-detail.component.ts to avoid duplicated role/source copy.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team Member detail now uses a unified profile grid with anchored action row and full-width Access alignment instead of floating blocks.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating src/app/modules/team/team-detail/team-detail.component.html and .scss so the page title aligns with the content container, avatar/member content uses a stable two-column grid, profile actions are grouped in a dedicated right-aligned header row, and the ACCESS section uses consistent width and row-grid alignment for operation name/detail, source, and role chips.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Clients all-groups endpoint now performs proc/column capability detection before querying, removing expected fallback failures from DB perf logs on mixed schemas.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/service/OperationService.js getAllOperationGroups to detect whether `sp_getAllOperationGroups` exists and whether `operationGroups.operationGroupActive` exists before selecting the query path. This avoids the old error-driven fallback chain (`Could not find stored procedure sp_getAllOperationGroups`, `Invalid column name operationGroupActive`) while preserving compatibility with both legacy and newer database shapes used by `/operations/groups/all` on the Clients page.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'A reversible direct-permission cutover path now exists to migrate non-admin operationUsers access into team-based assignments with backup/restore safety.',
        evidence:
          'Recorded in the snapshot API running change log after adding migration_sql/3.12.9migration-direct-permissions-team-cutover.sql. The migration adds cutover run/audit backup tables, sp_cutoverDirectOperationPermissionsToTeams (dry-run support, system-admin exclusion by default, optional dedicated one-user migration teams to avoid permission fan-out, and direct->team assignment migration), and sp_restoreDirectOperationPermissionsFromCutoverRun for rollback replay from backup. It also refreshes sp_getTeamMembersByTeamId so team member role labels still resolve from team-based access after direct permission cleanup.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team Access defaults now persist per-operation default manager and care-rep assignees with role-filtered bulk apply controls.',
        evidence:
          'Recorded in the snapshot frontend/API running logs after extending Team Access defaults to include `defaultManagerTeamMemberId` and `defaultCareRepTeamMemberId` per operation across the Team Access UI, Team models, and Team operation assignment API payloads. Client cards now support role-filtered manager/care-rep baskets, operation-level assignee selectors, and fill-unassigned vs overwrite-all bulk semantics while preserving desired-state save behavior for `/teams/{teamId}/operations`. Backend support was added with additive migration `3.12.8migration-team-operation-default-assignees.sql` plus updated Team controller/service normalization and encoding for the new fields. Validation used API `npm test` (syntax pass), frontend `npm run build -s`, focused Team Jest slices, and full frontend Jest regression (`113/113` suites).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team Access Team Defaults now uses a cascading Team -> Client -> Operation defaults workflow with client-level enable/mode controls, bulk role actions, and inheritance-state chips.',
        evidence:
          'Recorded in the snapshot frontend running change log after refactoring team-access.component.ts/.html/.scss to replace the flat grouped operation list with client cards that support client access enabled state, all-operations vs selected-operations mode, per-client bulk role apply (fill-unassigned or overwrite-all), per-operation enable toggles for selected mode, and state chips (Inherited, Custom, Unassigned, Disabled) while preserving existing desired-state save semantics for /teams/{teamId}/operations. The Team Access summary now reports enabled clients, enabled operations, manager defaults, care-rep defaults, and exception count. Validation used focused Jest on team-access.component.spec.ts (3/3 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'User Profile edit checklist now uses a structured two-column grid with tighter checkbox-label spacing and consistent row/column alignment.',
        evidence:
          'Recorded in the snapshot frontend running change log after refactoring the userInterests question layout in user-profile.component to use a real checkbox grid with compact checkbox+label option units, standardized checkbox-to-label spacing (~22px), controlled column gap (~72px), and shared row rhythm instead of ad-hoc spacing offsets. Validation used focused Jest on user-profile.component.spec.ts (7/7 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Client detail now keeps linked facilities visible without blinking/disappearing when selecting the same client group repeatedly.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating operation-listing and operation-operation-listing components so hydrated selected.operationGroup.operations are preserved across repeated route param emissions and sidebar reselection of the same group id. Client mode now avoids redundant re-hydration resets for the same group and the table initializes from hydrated input operations before fallback filtering. Validation used focused Jest on operation listing/table components (11/11 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Operation add/edit now supports lookahead search for Ownership group selection, making large client-group lists filterable in the form dialog area.',
        evidence:
          'Recorded in the snapshot frontend running change log after replacing the operation ownership ion-select with a typeahead input/list in operation-form.component and wiring reactive-form selection updates for operationGroupId. Search now matches both operationGroupName and operationGroupShortName with inline results in New Operation and Edit Operation. Validation used focused Jest on operation-form.component.spec.ts including lookahead filter/select coverage.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Clients Active/Archived listing is now resilient on mixed alpha database schemas and no longer blocked by duplicated Swagger response keys.',
        evidence:
          'Recorded in the snapshot API running change log after removing duplicated 400/401/404 response keys under GET /operations/groups/all in deployment/api/swagger.yaml (fixing local YAML boot parse failure) and hardening OperationService.getAllOperationGroups fallback queries to support databases where operationGroups.operationGroupActive is absent by returning a synthesized active flag. Validation used direct js-yaml parse of swagger plus node --check on OperationService.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Expired bearer sessions now auto-clear local auth state and redirect to login instead of repeatedly issuing unauthorized API calls.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating auth.service, app.module tokenGetter, and ErrorHandlerInterceptor to enforce userLoginExpires checks on stored JWTs, clear stale followup auth storage keys, and redirect on auth-related 401 responses outside /users/login. Validation used focused Jest on auth.service and error-handler interceptor specs (2/2 suites passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Teams now keeps selected-team state visible in both sidebar and header, expands selected-team members by top role assignment, and exposes admin create/rename/archive/restore controls in the sidebar.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating the team-listing sidebar and team-listing workspace slices to add active/archived team filtering, role-group expansion by top role label (Admins, Managers, Care Reps, Other), selected-team status badges, and team lifecycle actions for admins. Validation used focused Jest on team service/listing/sidebar specs (3/3 suites passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The API now includes explicit team CRUD and soft-archive endpoints, and archive can cascade-remove team-level and member-override permission assignments.',
        evidence:
          'Recorded in the snapshot API running change log after adding POST /teams, GET/PUT /teams/{teamId}, and DELETE /teams/{teamId} plus route-authorization policies in the Team controller/service/swagger stack. The archive route accepts cascadePermissions and removes records from teamOperationAssignments and teamMemberOperationOverrides when requested to prevent stale inherited access. Validation used node --check across the touched Team API files.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Clients now supports active/archived browsing with direct restore actions, and Teams has been reshaped into a teams-first workspace with selected-team members/access context.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating the operation-admin sidebar and operation-listing slices to add Active/Archived client filtering, archived restore controls, and selected-client archive status handling, and after refactoring the team-listing, team sidebar, and team members table slices so the Teams view now centers on selecting a team first and then working in Members or Access from the same main workspace header. Validation used focused Jest on operation/team touched slices (5/5 suites passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The API now exposes an all-clients operation-group endpoint so the frontend can browse archived client groups without overloading active-only routes.',
        evidence:
          'Recorded in the snapshot API running change log after adding GET /operations/groups/all in deployment/api/swagger.yaml, deployment/controllers/Operations.js, and deployment/service/OperationService.js. The service tries sp_getAllOperationGroups first and falls back to a direct operationGroups table query while preserving encoded ids and normalized operationGroupActive values for active/archive filtering in the Clients UI. Validation used node --check on the touched API controller/service files.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Team member detail and the operation assignment sidebar now show whether access is direct or team-managed, and the sidebar no longer tries to remove inherited rows through the direct assignment endpoints.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating src/app/modules/team/team-detail/team-detail.component.ts/.html/.scss, src/app/modules/operation/operation-admin-right-sidebar/operation-admin-right-sidebar.component.ts/.html/.scss, and src/app/modules/user/user.ts. Team detail ACCESS rows now render source pills plus direct/team role detail from the effective access payload, and the operation sidebar now derives both managers and care reps from the effective /operations/{operationId}/users roster, preserves direct add/remove for explicit direct assignments, and marks inherited rows as Manage from Teams instead of issuing legacy delete calls against team-managed access. Validation used focused Jest on the team-detail and operation-admin-right-sidebar slices (7/7 passing) plus npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Inherited team defaults and team-member exception state now flow through the existing user and operation access rosters instead of being isolated to the Team Access editor.',
        evidence:
          'Recorded in the snapshot API running change log after adding migration_sql/3.12.7migration-effective-team-access.sql, which creates dbo.teamMemberOperationOverrides, rewrites sp_getUserOperationsByUserId and sp_getAssignedUsersByOperationId to compute effective access from direct assignments plus team defaults plus member exceptions, and adds the /teams/{teamId}/members/{teamMemberId}/operations API for the member exception editor. Validation used rollback-scoped compile-validation of the migration, npm test on the API package, live apply to followup_alpha_20260517, and an isolated rollback transaction on alpha that proved inherited defaults, member override grants, and member revokes across all affected read paths.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The Team Access screen now supports per-member override and revoke editing on top of the team defaults, with effective-role context shown inline for each operation.',
        evidence:
          'Recorded in the snapshot frontend running change log after extending src/app/modules/team/team-access/team-access.component.ts, .html, and .scss with Team Defaults and Member Exceptions modes, adding the new TeamService member access calls, and surfacing the current team default, direct role, and effective role/source inside the member editor rows. Validation used focused Jest on the Team service and Team Access component (8/8 passing) plus npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'The snapshot now has a dedicated `teamOperationAssignments` data model plus desired-state stored procedures for team-level default operation roles, and that migration is already applied on alpha.',
        evidence:
          'Recorded in the snapshot API running change log after adding migration_sql/3.12.6migration-team-operation-assignments.sql, which creates dbo.teamOperationAssignments plus sp_getTeamOperationAssignmentsByTeamId and sp_setTeamOperationAssignmentsByTeamId. The new table stores default team-to-operation role mappings without changing the existing direct user assignment tables yet, and the write proc accepts a full JSON assignment set so the UI can manage defaults as desired state instead of issuing row-by-row calls. Validation used transactional compile-validation of the migration, npm test on the API package, application of the migration to followup_alpha_20260517, and a rollback-scoped alpha round-trip that wrote and read back two assignments through the new stored procedures.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Admins can now manage default team operation roles from a dedicated Team Access screen inside the Teams section instead of relying only on per-operation assignment surfaces.',
        evidence:
          'Recorded in the snapshot frontend running change log after adding src/app/modules/team/team-access/team-access.component.ts at /teams/:teamId/access, extending TeamService with /teams/{teamId}/operations read/write calls, and wiring entry points from the Teams listing, sidebar, and team-member detail view. The new screen loads the current team defaults plus the operations roster, groups rows by client/group, lets admins choose Unassigned, Manager, or Care Rep per operation, and saves the full desired state back through the new API endpoint while the sidebar now emits the team selection event it already exposed in the listing template. Validation used focused Jest on the Team service, Team Access component, and team sidebar slice (7/7 passing) plus npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Performance',
        summary:
          'The snapshot alpha `/users/{userId}/operations` hotspot no longer computes counts through the global `VW_operationCounts` view and now uses a user-scoped procedure plan instead.',
        evidence:
          'Recorded in the snapshot API running change log after adding migration_sql/3.12.5migration-user-operations-performance.sql and applying it to followup_alpha_20260517. The old sp_getUserOperationsByUserId was only a thin wrapper over VW_operationCounts, whose scalar subqueries forced the request to evaluate operation counts across the broader operations surface before filtering by the current user. The new procedure seeds distinct active user operations plus related patient ids into temp tables, computes latest patient status/admission/call state once per scoped patient, and aggregates only that reduced slice while preserving the existing row set. Validation used transactional compile-validation of the migration, EXCEPT-based equivalence checks against the previous proc for heavy users 11 and 19, and direct alpha benchmarking for userId 11 showing the same 72 rows with runtime reduced from 6388.3ms to 2030.7ms.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Local snapshot `NODE_ENV=dev` now defaults to the isolated alpha database instead of the production `followup` database when no `appDatabase` override is set.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/config/env/dev.json from `followup` to `followup_alpha_20260517`. The deployment/config/index.js loader treats `NODE_ENV=dev` as a file-backed local mode and resolves config.sql.database from process.env.appDatabase first, then from the checked-in dev.json fallback, so the previous default could connect local npm run dev sessions to prod unexpectedly. Validation used NODE_ENV=dev node -e "const config=require(\'./deployment/config\'); console.log(config.sql.database)" and confirmed the resolved local dev database is now followup_alpha_20260517.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The top-nav Notify dialog now keeps a visible shell while its notification-type options load, fixing the backdrop-only collapse on first open.',
        evidence:
          'Recorded in the frontend running change log after updating src/app/shell/notification-modal/notification-modal.component.html and .scss so the modal renders a persistent shell, title row, and loading state before createNotificationForm exists, and so the old component-scoped :root sizing rule is replaced by a real :host min-height block. Previously the unsaved branch rendered no root content until getNotificationTypes() returned, which let the shared auto-height followup-modal collapse to backdrop-only when toolbar-nav opened the Notify dialog. Validation used npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Snapshot Notify, Follow-up, and Post-it dialogs now use Ionic 8 modal host styling instead of the removed `.modal-wrapper` internals, restoring visible modal content after the framework migration.',
        evidence:
          'Recorded in the frontend running change log after replacing the legacy followup-modal and followup-post-it-modal wrapper selectors in theme.scss with ion-modal host variables and ::part(content/backdrop) styling that Ionic 8 actually honors. The shared modal entry points in toolbar-nav, patient follow-up completion, team detail, and team-members listing still opened these dialogs through the same cssClass values, so moving the sizing/overflow rules onto the modal host fixed the regression at the shared shell rather than at each call site. Validation used the focused notification-modal, toolbar-nav, team-detail, team-members-listing, and followup-complete-modal Jest slice (12/12 passing) plus npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Snapshot patient, user-profile, and operation contact-notification forms now use attached-label Ionic controls and flexible choice-row layouts instead of legacy nested Ionic 3 item markup.',
        evidence:
          'Recorded in the frontend running change log after updating the patient form, user-profile form, operation form, and theme.scss so checkbox/radio labels stay attached to their controls, wrapped labels no longer clip inside fixed-height rows, the discharge and notification choice lists use responsive flex/grid layouts, and obsolete global radio-internal overrides were removed from the migrated Ionic stack. Validation used the focused patient-form, user-profile, and operation-form Jest slice (48/48 passing) plus npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The local snapshot API now answers protected `/statusz` browser preflights before auth, so Service Health can call the endpoint from `http://localhost:4200` without a CORS failure.',
        evidence:
          'Recorded in the snapshot API running change log after moving cors() ahead of bearer-token parsing and the early /livez /statusz /healthz handlers in deployment/index.js. Before that change, the browser-issued OPTIONS request for Authorization-bearing /statusz calls hit auth first and returned 401 without Access-Control-Allow-Origin, which the browser surfaced as a CORS block. Validation used npm --prefix ../followup-api test after porting the middleware-order fix into the canonical snapshot API package.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Service Health now sends the current bearer token with its raw `/statusz` poller, so the protected API status check no longer falls back to unknown/degraded after the JWT auth rollout.',
        evidence:
          'Recorded in the frontend running change log after updating src/app/shell/shell.component.ts so the Service Health panel builds `Authorization: Bearer ...` headers from AuthenticationService.getToken() on each status poll even though it uses a raw HttpClient from HttpBackend. The previous implementation bypassed the interceptor chain, so `/statusz` stayed anonymous and the panel showed localhost:8080 · vunknown / UNKNOWN · unknown / Checked n/a once the API required JWT auth there. Validation used npm test -- --runInBand --runTestsByPath src/app/shell/shell.component.spec.ts (9/9 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Snapshot alpha/live bootstrap auth now ships a temporary hardcoded `ApiKeyAuth` value in the environment config so deployed login no longer depends on the flaky CI env injection path.',
        evidence:
          'Recorded in the frontend running change log after hardcoding `8341c9e6-8adb-469b-8d66-f58cbcda720c` into src/environments/environment.alpha.ts and src/environments/environment.prod.ts for the snapshot rc2 line. The earlier GitHub Actions and npm run env changes remain in source, but alpha/live bootstrap auth now resolves from the shipped environment bundle instead of relying on FOLLOWUP_API_KEY_AUTH / API_KEY_AUTH being injected during the build. Validation used npm test -- --runInBand --runTestsByPath src/app/shared/interceptors/api-key.interceptor.spec.ts (4/4 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Snapshot alpha login bootstrap now carries the `ApiKeyAuth` value through the frontend build pipeline instead of dropping it before bundle generation.',
        evidence:
          'Recorded in the frontend running change log after expanding package.json so npm run env exports FOLLOWUP_API_KEY_AUTH / API_KEY_AUTH into src/environments/.env.ts and updating the alpha frontend workflow to pass those values from GitHub Actions secrets into the build job. Live checks showed alpha-followup-api already had API_KEY_AUTH configured, login returned HTTP 403 without the header, and the same request returned HTTP 401 with the expected bootstrap key, confirming the issue was missing frontend build-time config rather than Azure App Service runtime config on the frontend. Validation used FOLLOWUP_API_KEY_AUTH=bootstrap-test-key npm run env -s plus the focused api-key interceptor and shell Jest slice.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Snapshot alpha service-worker registration now follows an explicit environment flag, keeping alpha out of the `ngsw-worker.js` MIME-type failure path while preserving production service-worker behavior.',
        evidence:
          'Recorded in the frontend running change log after updating src/app/app.module.ts plus the environment files so the snapshot keeps production mode but only registers ngsw-worker.js where serviceWorkerEnabled is true. This ports the live alpha fix into the v4.0.0 snapshot so the branch stays aligned with the canonical frontend runtime behavior. Validation used npm run build -s.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Privileged snapshot writes now enforce DB-backed admin, admin-or-manager, or admin-or-self authorization after Swagger validation instead of relying on JWT presence alone.',
        evidence:
          'Recorded in the API running change log after adding deployment/utils/routeAuthorization.js, wiring it into deployment/index.js, extending deployment/service/UserService.js with admin-or-manager checks, constraining user-owned writes like logout/avatar/cork-board/notification reply to the authenticated user or an admin, and removing the dead /users/auth stub from deployment/api/swagger.yaml plus the bootstrap API-key allowlist so shared ApiKeyAuth is now login-only. Validation used npm test (Syntax OK for 69 files).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The snapshot bootstrap API key is now environment-delivered and only sent on the login bootstrap request when explicitly configured.',
        evidence:
          'Recorded in the frontend running change log after exposing FOLLOWUP_API_KEY_AUTH / API_KEY_AUTH through the environment files, updating src/app/shared/interceptors/api-key.interceptor.ts to attach ApiKeyAuth only for /users/login when that env value exists, and extending the focused interceptor spec to cover both configured and empty-env behavior. Validation used npm test -- --runInBand --runTestsByPath src/app/shared/interceptors/api-key.interceptor.spec.ts (3/3 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The 4.0.0 snapshot now treats JWT auth as the default API gate instead of the shared API key, with bootstrap API-key checks limited to login-only auth paths.',
        evidence:
          'Recorded in the API running change log after updating deployment/index.js so all Swagger-backed routes require an authenticated JWT by default, the shared ApiKeyAuth check is only honored for /users/login and the legacy /users/auth stub, /statusz now requires JWT auth, and login bootstrap ignores stale expired bearer headers so retries are not blocked by leftover tokens. Validation used node --check deployment/index.js plus npm test (Syntax OK for 68 files).',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The shared API key is no longer broadcast on general frontend traffic and is now attached only to bootstrap auth requests.',
        evidence:
          'Recorded in the frontend running change log after narrowing src/app/shared/interceptors/api-key.interceptor.ts to send ApiKeyAuth only for /users/login and /users/auth, removing the explicit ApiKeyAuth header from the shell /statusz poller, and updating the focused interceptor coverage. Validation used the focused Jest slice for api-key.interceptor.spec.ts and shell.component.spec.ts (10/10 passing).',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The 4.0.0 snapshot service layer now lets pool failures reject once, Kicktech auth/email calls are bounded by AbortController timeouts, and the cork-board file endpoint uses the same hardened transfer path as avatars and /data.',
        evidence:
          'Recorded in the API running change log after removing the broken outer wrapper catch pattern from 27 deployment/service files, adding KICKTECH_REQUEST_TIMEOUT_MS-backed AbortController timeouts around Kicktech /register, /userlogin, and /email requests with clean rejection propagation through NotificationService, and porting deployment/controllers/UserCorkBoard.js onto deployment/utils/fileTransfers.js so uploads sanitize stored filenames and downloads use the shared stream/error handling path. Validation used npm test (Syntax OK for 68 files) plus explicit node --check validation across the edited service/client/controller slice.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The 4.0.0 snapshot now validates signed bearer JWTs on the highest-risk user mutation routes and records acting-user audit context instead of relying only on the shared API key for those paths.',
        evidence:
          'Recorded in the API running change log after adding requestAuth middleware to deployment/index.js, verifying bearer tokens with jsonwebtoken against the existing RS256 keypair, attaching decoded acting-user context, and enforcing authenticated access for PUT /users/{userId}, DELETE /users/{userId}, POST /users/impersonate, and POST /users/merge-script in the User controller/service slice. Validation used npm install, npm test, clean get_errors on the touched API auth files, and focused frontend auth Jest to confirm the companion bearer-token client path.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Snapshot login now persists the real JWT and only exposes JWT-shaped values to the existing JwtInterceptor, so legacy expiry stubs no longer get forwarded as broken bearer headers.',
        evidence:
          'Recorded in the frontend running change log after updating app.module tokenGetter plus AuthenticationService login storage to keep the raw JWT in followup-token, ignore non-JWT legacy localStorage values, and preserve the existing ApiKey interceptor alongside the restored bearer path. Validation used the focused auth.service Jest slice (5/5 passing) and clean get_errors on the touched frontend auth files.',
        source: 'v4.0.0/followup-frontend/agents.md'
      },
      {
        scope: 'Performance',
        summary:
          'Avatar/data downloads and SQL-pool lifecycle now have explicit cleanup paths instead of relying on unhandled async stream patterns and always-live timers.',
        evidence:
          'Recorded in the API running change log after replacing the async-IIFE file stream pattern with shared fileTransfers helpers, sanitizing uploaded filenames, handling download stream errors and client disconnects explicitly in the avatar/data controllers, and adding unref reconnect/watchdog timers plus signal-driven pool shutdown cleanup in ConnectionPoolService. Validation used npm test and clean get_errors on the touched runtime files.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'The 4.0.0 snapshot API dependency baseline now clears all critical audit findings while keeping the legacy Node/OAS runtime and shared SQL pool surface intact.',
        evidence:
          'Recorded in the API running change log after removing unused jsonwebtoken, upgrading mssql to 12.5.5, downgrading applicationinsights to 2.9.8 to avoid the vulnerable 3.x OpenTelemetry tree, upgrading js-yaml to 3.14.2 and nodemon to 3.1.14, and pinning safe overrides for body-parser, qs, form-data, and z-schema in the legacy router subtree. Validation used npm install, npm test, fresh npm audit, and npm ls applicationinsights js-yaml mssql; the audit baseline fell from 56 total / 38 high / 2 critical to 13 total / 10 high / 1 moderate / 0 critical without needing source edits in the SQL pool or telemetry bootstrap files.',
        source: 'v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Patient/user/operation forms now follow a consistent US country-code and phone-entry baseline, while patient add/edit keeps the RP-only emergency-contact behavior and normalizes malformed short discharge years before save.',
        evidence:
          'Recorded in the frontend running change log after patching patient/user-profile/operation-form logic+templates+specs so emergency-contact HIPAA mirrors Responsible Party, US country code defaults to 1 in phone forms, phone inputs normalize undashed values to dashed display/save formats, and discharge date entries with short years like 0026 are corrected to 2026 during blur/submission. Validation included focused Jest across patient-form, user-profile, and operation-form suites (48/48 passing).',
        source: 'v3.12.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Notifications listing now supports in-row status changes from a dropdown while still showing computed reply-aware status badges and reply counts.',
        evidence:
          'Recorded in the frontend running change log after wiring the notifications table status cell to onStatusChange, adding a status selector populated from API-backed status label ids present in the listing payload, and hardening the update path with a fallback so label/id updates stay visible even when the update response is minimal. Clean get_errors validation passed on the touched listing component/template/spec files.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Notification replies are now exposed from notification detail and patient history, and the reply modal/service slice has focused Jest coverage that matches the real POST contract.',
        evidence:
          'Recorded in the frontend running change log after wiring the reply modal into notification detail, adding the View / Reply link from patient history, rewriting the reply-modal spec to use Jest-native mocks, and adding the missing addNotificationReply HTTP contract test. Validation included focused Jest on the reply modal, notification service, notification detail, patient history listing, and login duplicate-account chooser slices.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Notification reply endpoints are now registered in the OpenAPI router instead of existing only in controller/service source, and the alpha smoke harness can exercise the live reply write/read path directly.',
        evidence:
          'Recorded in the API running change log after adding the notification reply paths to deployment/api/swagger.yaml, removing the broken outer catch pattern from NotificationReplyService, extending alpha-smoke with reply runtime coverage plus cleanup, and broadening the /data workbook assertion to accept valid XLSX application/zip responses. Predeploy alpha smoke reproduced the missing-route 404, and a source-level swagger parse check confirmed the reply routes are now present in the mounted spec.',
        source: 'v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The duplicate-account login chooser now presents as a centered overlay instead of overlapping the login form during the alpha multi-account path.',
        evidence:
          'Recorded in the frontend running change log and revalidated with focused Jest on the login component after the multi-account chooser layout was reworked into a dedicated overlay for duplicate-account testing on alpha.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Completed-patient status labels now retire three legacy outcomes without losing history by using an active flag in alpha plus proc-level filtering for the selection list.',
        evidence:
          'Recorded in the frontend and API running change logs after applying migration_sql/3.11.0migration-patient-status-labels.sql to followup_alpha_20260517, verifying with sqlcmd that Transferred to Another Facility, Hospice, and Transferred to Hospital from Facility now carry patientStatusLabelActive = 0, and confirming dbo.sp_getPatientStatusLabels returns zero deprecated rows. The frontend patient-status service also filters inactive labels as a rollout guard, backed by focused Jest coverage.',
        source: 'v3.11.0/followup-frontend/agents.md + v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'The existing 2026-05-14 queue and roster performance indexes are now codified in a checked-in additive migration so future alpha/live rebuilds can recreate the tuned query path from source control.',
        evidence:
          'Recorded in the frontend and API running change logs after querying both followup_alpha_20260517 and followup, confirming the deployed IX_tune_20260514_* indexes already exist for notifications, operations, operationUsers, patientAdmissions, patientCalls, patientCallStatuses, patientDischarges, patients, and patientStatuses, and adding migration_sql/3.12.3migration-performance-tuned-indexes.sql with conditional CREATE INDEX statements for that tuned set. Validation used sqlcmd with SET NOEXEC ON plus sqlcmd -b to compile-check the migration cleanly against alpha without executing it.',
        source: 'v3.11.0/followup-frontend/agents.md + v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary:
          'Canonical API SQL now lives under migration_sql, and notification reply support is present on live after the additive 3.11.0 plus 3.12.2 chain was applied.',
        evidence:
          'Recorded in the frontend and API running change logs after moving the versioned SQL files into followup-api/migration_sql, adding a checked-in manifest, audit, alpha NOEXEC validation wrapper, and corrective 3.12.4migration-assigned-users-deleted-filter.sql migration, then applying migration_sql/apply-live-notification-replies.sql to followup. Post-apply verification confirmed notificationReplies, its three indexes, LEFT JOIN-safe reply read procedures, reply insert operationId resolution, and zero pending notification-reply operation backfill rows on live.',
        source: 'v3.11.0/followup-frontend/agents.md + v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Release',
        summary:
          'Alpha frontend and API App Services are now pinned to Windows Node 20 LTS for pre-live runtime validation, replacing the older mixed alpha baseline.',
        evidence:
          'Recorded in the frontend and API running change logs after Azure CLI inspection showed live followupcare carrying no explicit Node pin, live followupcare-api carrying WEBSITE_NODE_DEFAULT_VERSION 12.13.0, and alpha apps carrying 12.13.0 / ~18 before the change. Both alpha apps were updated to WEBSITE_NODE_DEFAULT_VERSION ~20, then validated with HTTP 200 responses from the frontend root plus API healthz, livez, statusz, and users routes.',
        source: 'v3.11.0/followup-frontend/agents.md + v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Wizard Bridge alpha now has explicit workbook-selection plumbing and alpha-safe workbook preparation instead of relying on a single hardcoded /data asset.',
        evidence:
          'Recorded in the API running change log after updating deployment/controllers/Data.js so /data honors WIZARD_BRIDGE_WORKBOOK or DATA_REPORT_FILE_NAME, extending alpha smoke to verify both GET /patients/statuses and GET /data, rebuilding data-dev.xlsx so its workbook connections target followup_alpha_20260517, and switching alpha-followup-api to WIZARD_BRIDGE_WORKBOOK=data-dev.xlsx while live remains on data.xlsx. Health checks stayed green through the app-setting change; final /data cutover verification depends on the active alpha deploy serving the new runtime.',
        source: 'v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The dedicated client edit page now supports soft archive/delete as well as rename, so admins can retire client groups directly from /clients/:operationGroupId/edit instead of falling back to legacy operation-group workflows.',
        evidence:
          'Recorded in the frontend running change log with focused Jest on operation-group-form and operation.service after adding the archive action, confirmation flow, local client-cache cleanup, and client-roster redirect behavior.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Operation-group deactivation now follows the same affected-row success contract as operation-contact deletes, and the alpha smoke harness now covers client create/detail/deactivate lifecycle checks.',
        evidence:
          'Recorded in the API running change log after a live alpha smoke reproduced DELETE /operations/groups/{operationGroupId} returning 400 {} pre-redeploy, followed by a source fix in deployment/service/OperationService.js and clean syntax validation on the touched file.',
        source: 'v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The home Everybody banner is back as a fixed browser-bottom frame instead of hovering above the home content.',
        evidence:
          'Recorded in the frontend running change log with a focused home component Jest pass and a clean error scan on the touched home stylesheet after restoring the original home layout and converting the footer callout into a fixed bottom browser bar.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Admin Edit User now renders through the app module graph correctly because the profile route and component are owned by the imported profile feature module instead of a routing-only import path.',
        evidence:
          'Recorded in the frontend running change log with a successful frontend build after moving user-profile route ownership into UserProfileModule and importing that module into AppModule, plus clean error scans on the touched module files.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Admin user edit now tolerates malformed legacy profile fields instead of blanking the detail screen, and shared action buttons use centered label alignment again.',
        evidence:
          'Recorded in the frontend running change log with focused Jest on user-profile covering malformed legacy interests/date payloads, plus clean error scans on user-profile and the shared theme stylesheet.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'User Management now runs as a standard admin roster with effective permission labels, issue-specific duplicate debug tools, admin user edit routes, first-class Clients listing/detail/edit routes wired from the shell menu, and operation forms no longer host the legacy inline client-group editor.',
        evidence:
          'Recorded in the frontend running change log with focused Jest on user-listing, user-profile, operation-listing, operation-admin-sidebar, operation-group-form, toolbar-nav, and operation-form, plus clean error scans on the touched routing and component files.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'Service health moved under Admin and now supports close, drag, timed auto-hide, and degraded persistence.',
        evidence:
          'Recorded in the frontend running change log with focused Jest coverage on the shell and toolbar-nav slices plus a successful production build.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Protected /statusz now reports version, database identity, request profiling, and database ping timing.',
        evidence: 'Recorded in the API running change log and backed by syntax validation on deployment/index.js.',
        source: 'v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Database',
        summary: 'Notification reply support is now present on the isolated alpha database copy.',
        evidence:
          'migration_sql/3.11.0migration.sql was applied to followup_alpha_20260517 and verified directly with sqlcmd plus sys.objects/sys.indexes checks.',
        source: 'v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'User Management is now a jumpable duplicate-account workbench with collapsible groups, clearer merge guidance, and a shell header that opens Service Health directly while keeping the Version Change Log inside the service-health widget.',
        evidence:
          'Recorded in the frontend running change log with focused Jest on user-listing, toolbar-nav, and shell after relabeling the Operations nav to Clients, rebuilding the top nav out of plain shell markup so dropdowns stay interactive above the content layer, and moving the verbose version summary below the search-version chips.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'Duplicate-account remediation now includes account-choice login handling, admin merge-workup generation, and expanded alpha smoke coverage around /users, /users/merge-script, /operations, and default operation-contact flows.',
        evidence:
          'Recorded in the API running change log, with syntax validation on the touched controllers/services and source-level smoke harness updates; live alpha still needs redeploy for the operation-contact delete status fix.',
        source: 'v3.11.0/followup-api/agents.md'
      }
    ]
  },
  {
    version: '3.10.0-rc3',
    recordedAt: '2026-05-14',
    label: 'Coordinated alpha release candidate',
    notes: 'This release candidate is the markdown-backed point where both alpha apps were version-bumped together.',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Frontend package metadata was promoted to 3.10.0-rc3 and the alpha deployment completed successfully.',
        evidence:
          'The frontend change log records the version bump and the successful GitHub Actions deployment run 25835387407.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary: 'API package metadata was promoted to 3.10.0-rc3 and the alpha deployment completed successfully.',
        evidence:
          'The API change log records the version bump and the successful GitHub Actions deployment run 25835389683.',
        source: 'v3.11.0/followup-api/agents.md'
      },
      {
        scope: 'Performance',
        summary:
          'Profiling instrumentation and first-pass home/queue performance hardening landed around the RC window.',
        evidence:
          'Frontend and API change logs both record request timing, DB profiling, and queue/home performance work during 2026-05-13 and 2026-05-14.',
        source: 'v3.11.0/followup-frontend/agents.md + v3.11.0/followup-api/agents.md'
      }
    ]
  },
  {
    version: '3.12.0',
    recordedAt: '2026-05-20',
    label: 'Alpha release baseline before 3.12.1 closeout',
    notes:
      'This release captured the notification replies runtime rollout and the notification status listing improvements before the coordinated 3.12.1 package stamp.',
    entries: [
      {
        scope: 'Frontend',
        summary:
          'Frontend 3.12.0 rollout shipped notification reply visibility across detail/history screens and dynamic status/reply indicators in notification listing.',
        evidence:
          'Frontend alpha branch received the reply-display and status-badge commits, including the in-table status workflow groundwork and service-health log synchronization for alpha verification.',
        source: 'v3.12.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary:
          'API 3.12.0 rollout mounted notification reply routes in OpenAPI and included smoke-harness coverage for reply write/read lifecycle checks.',
        evidence:
          'API alpha branch carried the reply-route registration in swagger plus reply smoke coverage updates recorded in the API running change log.',
        source: 'v3.12.0/followup-api/agents.md'
      }
    ]
  },
  {
    version: '3.10.0',
    recordedAt: '2026-05-10',
    label: 'Alpha baseline release',
    notes:
      'This is the oldest currently-known version marker in the markdown logs, so it acts as the baseline for “since version” lookups.',
    entries: [
      {
        scope: 'Frontend',
        summary: 'Frontend was promoted to 3.10.0 on alpha with build validation and tag push evidence recorded.',
        evidence:
          'The frontend change log records the alpha release metadata update, validation build, and tag creation.',
        source: 'v3.11.0/followup-frontend/agents.md'
      },
      {
        scope: 'API',
        summary: 'API was promoted to 3.10.0 on alpha with deployment hardening and tag push evidence recorded.',
        evidence:
          'The API change log records the alpha release update plus workflow and Azure deployment hardening around the same release.',
        source: 'v3.11.0/followup-api/agents.md'
      }
    ]
  }
];
