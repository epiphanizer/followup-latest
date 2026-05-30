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
    version: '4.0.0',
    recordedAt: '2026-05-30',
    label: 'Current alpha candidate',
    notes: 'Evidence comes from the v4.0.0 frontend and API markdown change logs and is kept in sync with them.',
    entries: [
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
