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
    version: '3.11.0',
    recordedAt: '2026-05-17',
    label: 'Current alpha candidate',
    notes: 'Evidence comes from the v3.11.0 frontend and API markdown change logs and is kept in sync with them.',
    entries: [
      {
        scope: 'Release',
        summary:
          'Alpha frontend and API App Services are now pinned to Windows Node 20 LTS for pre-live runtime validation, replacing the older mixed alpha baseline.',
        evidence:
          'Recorded in the frontend and API running change logs after Azure CLI inspection showed live followupcare carrying no explicit Node pin, live followupcare-api carrying WEBSITE_NODE_DEFAULT_VERSION 12.13.0, and alpha apps carrying 12.13.0 / ~18 before the change. Both alpha apps were updated to WEBSITE_NODE_DEFAULT_VERSION ~20, then validated with HTTP 200 responses from the frontend root plus API healthz, livez, statusz, and users routes.',
        source: 'v3.11.0/followup-frontend/agents.md + v3.11.0/followup-api/agents.md'
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
