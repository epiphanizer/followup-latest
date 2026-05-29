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
    recordedAt: '2026-05-20',
    label: 'Current alpha candidate',
    notes: 'Evidence comes from the v4.0.0 frontend and API markdown change logs and is kept in sync with them.',
    entries: [
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
          'Recorded in the frontend and API running change logs after applying 3.11.0migration-patient-status-labels.sql to followup_alpha_20260517, verifying with sqlcmd that Transferred to Another Facility, Hospice, and Transferred to Hospital from Facility now carry patientStatusLabelActive = 0, and confirming dbo.sp_getPatientStatusLabels returns zero deprecated rows. The frontend patient-status service also filters inactive labels as a rollout guard, backed by focused Jest coverage.',
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
          '3.11.0migration.sql was applied to followup_alpha_20260517 and verified directly with sqlcmd plus sys.objects/sys.indexes checks.',
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
