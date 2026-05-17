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
    notes: 'Evidence comes from the v3.11.0 frontend and API markdown change logs.',
    entries: [
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
