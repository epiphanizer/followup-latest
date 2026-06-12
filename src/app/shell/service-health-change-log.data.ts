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
    version: '4.0.0_alpha_rc4',
    recordedAt: '2026-06-12',
    label: 'Current alpha rc4 candidate',
    notes: 'Evidence comes from the v4.0.0 frontend and API markdown change logs and is kept in sync with them.',
    entries: [
      {
        scope: 'Release',
        summary: 'The current v4 alpha snapshot is now tagged and surfaced as `4.0.0_alpha_rc4` across the frontend build metadata, API package metadata, and the Service Health version history.',
        evidence:
          'Recorded after promoting both `v4.0.0/followup-frontend` and `v4.0.0/followup-api` package metadata from `4.0.0_alpha_rc2` to `4.0.0_alpha_rc4`, updating `src/environments/.env.ts`, and retagging this top Service Health release entry so the active alpha shows up consistently in the shell version panel and status payloads.',
        source: 'v4.0.0/followup-frontend/agents.md + v4.0.0/followup-api/agents.md'
      },
      {
        scope: 'Frontend',
        summary:
          'The editable Teams roster Position dropdown now resolves its selected option from the active team membership role instead of falling through to `Admin` when only the numeric role id is missing.',
        evidence:
          'Recorded in the snapshot frontend running change log after updating `src/app/modules/team/team-listing/team-members-listing/team-members-listing.component.ts` and `.html` so the roster dropdown prefers `teamMemberRoleLabelId`, falls back only to the same row\'s team-scoped `teamMemberRoleLabel`, and explicitly marks the matching option selected. This closes the remaining mismatch where the Teams left sidebar correctly grouped members under `Managers` while the editable roster dropdown still visually defaulted to `Admin`. Validation used focused Jest on the team-members listing slice (`10/10` passing).',
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
          'Team Access and Teams sidebar role-derived UI now prefer the active team\'s stored membership role before any broader effective label fallback.',
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
          'Recorded in the snapshot API/frontend running change logs after tightening `v4.0.0/followup-api/migration_sql/3.12.12migration-team-member-general-role.sql` and reapplying it to `followup_alpha_20260517`. The first stored-procedure cut still treated `operationUsers` as globally authoritative during null-role backfill and `sp_getTeamMembersByTeamId` effective-role derivation, which allowed a stronger direct role from unrelated operations to make the current team roster still display `Admin` after a successful team-role update. The migration now scopes direct-role candidates to the selected team\'s operation set before deriving fallback/effective team roles. Validation used direct `sqlcmd -b -i` reapply plus before/after mismatch probes, where a live `storedRoleId = 2 / effectiveRoleId = 1` mismatch disappeared under the corrected team-scoped derivation.',
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
          'Changing a team member\'s Position from the Teams roster now propagates into the actual Team Access permission matrix instead of only storing a display role on the membership row.',
        evidence:
          'Recorded in the snapshot API running change log after updating deployment/controllers/Team.js, deployment/service/TeamService.js, and migration_sql/3.12.12migration-team-member-general-role.sql. The earlier role route only wrote `userTeams.teamMemberRoleLabelId`; it now also rewrites that member\'s `teamMemberOperationOverrides` across the current team access scope so effective permissions follow the selected team role. The canonical SQL source was widened at the same time so Team Access constraints and write procedures accept `Admin` (`1`) alongside `Manager` and `Care Rep`. Validation used `npm test --silent` (`Syntax OK for 69 files`).',
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
          'The Teams sidebar `TODAY\'S DATE` block now sits on the same column width as the other major sidebars instead of rendering inside a wider Teams column.',
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
