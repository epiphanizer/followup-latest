import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Operation } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';
import {
  Team,
  TeamMember,
  TeamMemberOperationAccessEntry,
  TeamMemberOperationAccessPutItem,
  TeamOperationAssignment,
  TeamOperationAssignmentPutItem
} from '@app/modules/team/team';
import { TeamService } from '@app/modules/team/team.service';

type TeamAccessEditor = 'team' | 'member';
type TeamClientAccessMode = 'allOperations' | 'selectedOperations';

interface TeamAccessEntry {
  operationId: string;
  operationName: string;
  operationGroupId?: string;
  operationGroupName: string;
  operationActive?: number;
  operationSelected: boolean;
  selectedRoleId: number;
}

interface TeamAccessClientCard {
  key: string;
  operationGroupId?: string;
  operationGroupName: string;
  entries: TeamAccessEntry[];
  enabled: boolean;
  expanded: boolean;
  accessMode: TeamClientAccessMode;
  bulkRoleId: number;
}

interface TeamMemberAccessEntry {
  operationId: string;
  operationName: string;
  operationGroupId?: string;
  operationGroupName: string;
  operationActive?: number;
  selectedState: string;
  teamRoleLabel?: string;
  directRoleLabel?: string;
  effectiveRoleLabel?: string;
  effectiveAccessSourceLabel?: string;
}

interface TeamAccessGroup<TEntry> {
  groupName: string;
  entries: TEntry[];
}

@Component({
  selector: 'app-team-access',
  templateUrl: './team-access.component.html',
  styleUrls: ['./team-access.component.scss'],
  standalone: false
})
export class TeamAccessComponent implements OnInit {
  readonly roleOptions = [
    { label: 'Unassigned', value: 0 },
    { label: 'Manager', value: 2 },
    { label: 'Care Rep', value: 3 }
  ];
  readonly memberAccessStateOptions = [
    { label: 'Team Default', value: 'default' },
    { label: 'Override: Manager', value: 'override:2' },
    { label: 'Override: Care Rep', value: 'override:3' },
    { label: 'Revoke', value: 'revoke' }
  ];

  teamId: string;
  team: Team;
  activeEditor: TeamAccessEditor = 'team';
  isLoading: boolean = true;
  isSaving: boolean = false;
  isDirty: boolean = false;
  loadError: string = '';
  allOperations: Operation[] = [];
  entries: TeamAccessEntry[] = [];
  teamAccessClients: TeamAccessClientCard[] = [];
  teamMembers: TeamMember[] = [];
  selectedTeamMemberId: string = '';
  memberEntries: TeamMemberAccessEntry[] = [];
  groupedMemberEntries: TeamAccessGroup<TeamMemberAccessEntry>[] = [];
  isMemberLoading: boolean = false;
  isMemberSaving: boolean = false;
  isMemberDirty: boolean = false;
  memberLoadError: string = '';
  private initialSnapshot: string = '[]';
  private memberInitialSnapshot: string = '[]';

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private operationService: OperationService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.teamId = this.route.snapshot.params.teamId;
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.teamId = params.get('teamId');
      this.loadTeamAccess();
    });
  }

  get assignedCount(): number {
    return this.teamDefaultsSummary.assignedDefaults;
  }

  get roleEligibleMembers() {
    const members = this.teamMembers || [];
    const managerEligible = members.filter(member => {
      const role = String(member.teamMemberRoleLabel || '').toLowerCase();
      return role.includes('manager') || role.includes('admin');
    });
    const careRepEligible = members.filter(member => {
      const role = String(member.teamMemberRoleLabel || '').toLowerCase();
      return role.includes('care') || role.includes('rep') || role.includes('manager') || role.includes('admin');
    });

    return {
      managerEligible,
      careRepEligible
    };
  }

  get teamDefaultsSummary() {
    const clientsEnabled = this.teamAccessClients.filter(client => client.enabled).length;
    const totalClients = this.teamAccessClients.length;

    let operationsEnabled = 0;
    let totalOperations = 0;
    let managerDefaults = 0;
    let careRepDefaults = 0;
    let assignedDefaults = 0;

    this.teamAccessClients.forEach(client => {
      totalOperations += client.entries.length;

      client.entries.forEach(entry => {
        const isInScope = this.isEntryInClientScope(client, entry);
        if (!isInScope) {
          return;
        }

        operationsEnabled += 1;
        if (entry.selectedRoleId > 0) {
          assignedDefaults += 1;
        }
        if (entry.selectedRoleId === 2) {
          managerDefaults += 1;
        }
        if (entry.selectedRoleId === 3) {
          careRepDefaults += 1;
        }
      });
    });

    return {
      clientsEnabled,
      totalClients,
      operationsEnabled,
      totalOperations,
      managerDefaults,
      careRepDefaults,
      assignedDefaults,
      exceptions: this.memberEntries.filter(entry => entry.selectedState !== 'default').length
    };
  }

  get selectedTeamMember(): TeamMember | null {
    return this.teamMembers.find(teamMember => teamMember.teamMemberId === this.selectedTeamMemberId) || null;
  }

  get currentDescription(): string {
    if (this.activeEditor === 'member') {
      return 'Apply member-specific overrides or revocations on top of the team defaults. Direct assignments from the operation admin surfaces still win independently.';
    }

    return "Set the team's default role for each operation. Member-specific direct assignments and revocations will build on top of these defaults.";
  }

  get currentSummary(): string {
    if (this.activeEditor === 'member') {
      if (!this.selectedTeamMember) {
        return 'Select a team member to review their exceptions.';
      }

      const exceptionCount = this.memberEntries.filter(entry => entry.selectedState !== 'default').length;
      return `${exceptionCount} exception${exceptionCount === 1 ? '' : 's'} across ${this.memberEntries.length} operations for ${this.selectedTeamMember.teamMemberFirstName} ${this.selectedTeamMember.teamMemberLastName}.`;
    }

    const summary = this.teamDefaultsSummary;
    return `Client access: ${summary.clientsEnabled} of ${summary.totalClients} enabled. Operation access: ${summary.operationsEnabled} of ${summary.totalOperations}. Manager defaults: ${summary.managerDefaults}. Care Rep defaults: ${summary.careRepDefaults}. Exceptions: ${summary.exceptions}.`;
  }

  get currentSaveDisabled(): boolean {
    if (this.activeEditor === 'member') {
      return (
        !this.isMemberDirty ||
        this.isLoading ||
        this.isMemberLoading ||
        this.isMemberSaving ||
        !this.selectedTeamMemberId
      );
    }

    return !this.isDirty || this.isLoading || this.isSaving;
  }

  get currentSaveLabel(): string {
    if (this.activeEditor === 'member') {
      return this.isMemberSaving ? 'Saving...' : 'Save Member Exceptions';
    }

    return this.isSaving ? 'Saving...' : 'Save Team Defaults';
  }

  onRoleChange() {
    this.recomputeDirtyState();
  }

  onMemberAccessChange() {
    this.isMemberDirty = this.createMemberSnapshot(this.memberEntries) !== this.memberInitialSnapshot;
  }

  setActiveEditor(editor: TeamAccessEditor) {
    this.activeEditor = editor;

    if (editor === 'member' && this.selectedTeamMemberId && !this.groupedMemberEntries.length && !this.isMemberLoading) {
      this.loadMemberAccess();
    }
  }

  selectTeamMember(teamMemberId: string) {
    if (!teamMemberId || teamMemberId === this.selectedTeamMemberId) {
      return;
    }

    this.selectedTeamMemberId = teamMemberId;
    this.loadMemberAccess();
  }

  saveActiveChanges() {
    if (this.activeEditor === 'member') {
      this.saveMemberAccess();
      return;
    }

    this.saveAssignments();
  }

  saveAssignments() {
    if (!this.teamId || this.isSaving) {
      return;
    }

    const assignments: TeamOperationAssignmentPutItem[] = [];
    this.teamAccessClients.forEach(client => {
      client.entries.forEach(entry => {
        if (!this.isEntryInClientScope(client, entry)) {
          return;
        }

        if (entry.selectedRoleId > 0) {
          assignments.push({
            operationId: entry.operationId,
            operationUserRoleLabelId: entry.selectedRoleId
          });
        }
      });
    });

    this.isSaving = true;
    this.teamService
      .setTeamOperationAssignmentsByTeamId(this.teamId, assignments)
      .pipe(take(1))
      .subscribe({
        next: (updatedAssignments: TeamOperationAssignment[]) => {
          this.entries = this.buildEntries(this.allOperations, updatedAssignments || []);
          this.teamAccessClients = this.buildClientCards(this.entries);
          this.initialSnapshot = this.createSnapshot(this.entries);
          this.isDirty = false;
          this.isSaving = false;
          if (this.selectedTeamMemberId) {
            this.loadMemberAccess();
          }
          this.toastrService.success('Team access successfully saved.');
        },
        error: () => {
          this.isSaving = false;
          this.toastrService.error('Could not save team access.');
        }
      });
  }

  saveMemberAccess() {
    if (!this.teamId || !this.selectedTeamMemberId || this.isMemberSaving) {
      return;
    }

    const assignments = this.memberEntries
      .filter(entry => entry.selectedState !== 'default')
      .map(entry => this.mapMemberEntryToPutItem(entry));

    this.isMemberSaving = true;
    this.teamService
      .setTeamMemberOperationAccessByTeamIdAndTeamMemberId(this.teamId, this.selectedTeamMemberId, assignments)
      .pipe(take(1))
      .subscribe({
        next: (updatedEntries: TeamMemberOperationAccessEntry[]) => {
          this.memberEntries = this.buildMemberEntries(updatedEntries || []);
          this.groupedMemberEntries = this.groupEntries(this.memberEntries);
          this.memberInitialSnapshot = this.createMemberSnapshot(this.memberEntries);
          this.isMemberDirty = false;
          this.isMemberSaving = false;
          this.toastrService.success('Team member access successfully saved.');
        },
        error: () => {
          this.isMemberSaving = false;
          this.toastrService.error('Could not save member access.');
        }
      });
  }

  private loadTeamAccess() {
    this.isLoading = true;
    this.isSaving = false;
    this.isDirty = false;
    this.loadError = '';
    this.memberLoadError = '';
    this.isMemberDirty = false;
    this.isMemberSaving = false;
    this.isMemberLoading = false;
    this.teamMembers = [];
    this.selectedTeamMemberId = '';
    this.memberEntries = [];
    this.groupedMemberEntries = [];
    this.memberInitialSnapshot = '[]';
    this.teamAccessClients = [];

    forkJoin({
      teams: this.teamService.getTeams().pipe(take(1)),
      operations: this.operationService.getAllOperations().pipe(take(1)),
      assignments: this.teamService.getTeamOperationAssignmentsByTeamId(this.teamId).pipe(take(1)),
      teamMembers: this.teamService.getTeamMembersByTeamId(this.teamId).pipe(take(1))
    }).subscribe({
      next: result => {
        const teams = (result.teams || []) as Team[];
        const operations = (result.operations || []) as Operation[];
        const assignments = (result.assignments || []) as TeamOperationAssignment[];
        const teamMembers = (result.teamMembers || []) as TeamMember[];

        this.team = teams.find((team: Team) => team.teamId === this.teamId) || null;
        this.allOperations = operations;
        this.entries = this.buildEntries(this.allOperations, assignments);
        this.teamAccessClients = this.buildClientCards(this.entries);
        this.initialSnapshot = this.createSnapshot(this.entries);
        this.teamMembers = teamMembers.sort((left, right) => {
          const lastNameDifference = (left.teamMemberLastName || '').localeCompare(right.teamMemberLastName || '');
          if (lastNameDifference !== 0) {
            return lastNameDifference;
          }

          return (left.teamMemberFirstName || '').localeCompare(right.teamMemberFirstName || '');
        });
        this.selectedTeamMemberId = this.teamMembers[0]?.teamMemberId || '';
        this.isLoading = false;

        if (this.selectedTeamMemberId) {
          this.loadMemberAccess();
        }
      },
      error: () => {
        this.loadError = 'We had trouble loading the team access view.';
        this.isLoading = false;
      }
    });
  }

  private loadMemberAccess() {
    if (!this.teamId || !this.selectedTeamMemberId) {
      return;
    }

    this.isMemberLoading = true;
    this.isMemberSaving = false;
    this.isMemberDirty = false;
    this.memberLoadError = '';

    this.teamService
      .getTeamMemberOperationAccessByTeamIdAndTeamMemberId(this.teamId, this.selectedTeamMemberId)
      .pipe(take(1))
      .subscribe({
        next: (memberAccessEntries: TeamMemberOperationAccessEntry[]) => {
          this.memberEntries = this.buildMemberEntries(memberAccessEntries || []);
          this.groupedMemberEntries = this.groupEntries(this.memberEntries);
          this.memberInitialSnapshot = this.createMemberSnapshot(this.memberEntries);
          this.isMemberLoading = false;
        },
        error: () => {
          this.memberLoadError = 'We had trouble loading member access.';
          this.isMemberLoading = false;
        }
      });
  }

  private buildEntries(operations: Operation[], assignments: TeamOperationAssignment[]): TeamAccessEntry[] {
    const assignmentsByOperationId = new Map<string, TeamOperationAssignment>();
    (assignments || []).forEach(assignment => {
      assignmentsByOperationId.set(assignment.operationId, assignment);
    });

    return (operations || [])
      .filter(operation => {
        const assignment = assignmentsByOperationId.get(operation.operationId);
        return Number(operation.operationActive) !== 0 || !!assignment;
      })
      .map(operation => {
        const assignment = assignmentsByOperationId.get(operation.operationId);
        return {
          operationId: operation.operationId,
          operationName: operation.operationName || 'Unnamed Operation',
          operationGroupId: operation.operationGroupId,
          operationGroupName: operation.operationGroupName || 'Other',
          operationActive: Number(operation.operationActive),
          operationSelected: Number(assignment?.operationUserRoleLabelId) > 0,
          selectedRoleId: Number(assignment?.operationUserRoleLabelId) || 0
        };
      })
      .sort((left, right) => {
        const groupDifference = (left.operationGroupName || '').localeCompare(right.operationGroupName || '');
        if (groupDifference !== 0) {
          return groupDifference;
        }

        return (left.operationName || '').localeCompare(right.operationName || '');
      });
  }

  private buildClientCards(entries: TeamAccessEntry[]): TeamAccessClientCard[] {
    const clientByKey = new Map<string, TeamAccessClientCard>();

    (entries || []).forEach(entry => {
      const key = String(entry.operationGroupId || entry.operationGroupName || 'other');
      if (!clientByKey.has(key)) {
        clientByKey.set(key, {
          key,
          operationGroupId: entry.operationGroupId,
          operationGroupName: entry.operationGroupName || 'Other',
          entries: [],
          enabled: false,
          expanded: false,
          accessMode: 'selectedOperations',
          bulkRoleId: 0
        });
      }

      clientByKey.get(key).entries.push(entry);
    });

    return Array.from(clientByKey.values())
      .map(client => {
        client.entries = [...client.entries].sort((left, right) =>
          (left.operationName || '').localeCompare(right.operationName || '')
        );
        client.enabled = client.entries.some(entry => entry.operationSelected || entry.selectedRoleId > 0);
        client.accessMode = client.enabled && client.entries.every(entry => entry.operationSelected)
          ? 'allOperations'
          : 'selectedOperations';
        client.expanded = client.enabled;
        client.bulkRoleId = this.resolveClientBulkRole(client);
        return client;
      })
      .sort((left, right) => left.operationGroupName.localeCompare(right.operationGroupName));
  }

  private resolveClientBulkRole(client: TeamAccessClientCard): number {
    const assignedEntries = client.entries.filter(entry => this.isEntryInClientScope(client, entry) && entry.selectedRoleId > 0);
    if (!assignedEntries.length) {
      return 0;
    }

    const roleCounts = assignedEntries.reduce((counts, entry) => {
      counts[entry.selectedRoleId] = (counts[entry.selectedRoleId] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);

    return Number(
      Object.keys(roleCounts).sort((left, right) => Number(roleCounts[Number(right)]) - Number(roleCounts[Number(left)]))[0]
    );
  }

  isEntryInClientScope(client: TeamAccessClientCard, entry: TeamAccessEntry): boolean {
    if (!client.enabled) {
      return false;
    }

    if (client.accessMode === 'allOperations') {
      return true;
    }

    return !!entry.operationSelected;
  }

  toggleClientEnabled(client: TeamAccessClientCard, enabled: boolean) {
    client.enabled = enabled;
    if (enabled && client.accessMode === 'allOperations') {
      client.entries.forEach(entry => {
        entry.operationSelected = true;
      });
    }
    this.recomputeDirtyState();
  }

  setClientAccessMode(client: TeamAccessClientCard, accessMode: TeamClientAccessMode) {
    client.accessMode = accessMode;
    if (accessMode === 'allOperations') {
      client.entries.forEach(entry => {
        entry.operationSelected = true;
      });
    }
    this.recomputeDirtyState();
  }

  toggleClientExpanded(client: TeamAccessClientCard) {
    client.expanded = !client.expanded;
  }

  applyBulkRole(client: TeamAccessClientCard, overwriteAll: boolean) {
    if (!client.enabled || client.bulkRoleId <= 0) {
      return;
    }

    client.entries.forEach(entry => {
      if (!this.isEntryInClientScope(client, entry)) {
        return;
      }

      if (!overwriteAll && entry.selectedRoleId > 0) {
        return;
      }

      entry.selectedRoleId = client.bulkRoleId;
      entry.operationSelected = true;
    });
    this.recomputeDirtyState();
  }

  clearClientRoles(client: TeamAccessClientCard) {
    client.entries.forEach(entry => {
      if (!this.isEntryInClientScope(client, entry)) {
        return;
      }
      entry.selectedRoleId = 0;
    });
    this.recomputeDirtyState();
  }

  onOperationSelectedChange(client: TeamAccessClientCard, entry: TeamAccessEntry, selected: boolean) {
    entry.operationSelected = selected;
    if (!selected) {
      entry.selectedRoleId = 0;
    }
    this.recomputeDirtyState();
  }

  onOperationRoleChange(client: TeamAccessClientCard, entry: TeamAccessEntry, roleId: number) {
    entry.selectedRoleId = Number(roleId) || 0;
    if (entry.selectedRoleId > 0) {
      entry.operationSelected = true;
    }
    client.bulkRoleId = this.resolveClientBulkRole(client);
    this.recomputeDirtyState();
  }

  getClientOperationAssignedCount(client: TeamAccessClientCard): number {
    return client.entries.filter(entry => this.isEntryInClientScope(client, entry) && entry.selectedRoleId > 0).length;
  }

  getClientOperationEnabledCount(client: TeamAccessClientCard): number {
    return client.entries.filter(entry => this.isEntryInClientScope(client, entry)).length;
  }

  getEntryStateLabel(client: TeamAccessClientCard, entry: TeamAccessEntry): string {
    if (!client.enabled) {
      return 'No Access';
    }

    if (client.accessMode === 'selectedOperations' && !entry.operationSelected) {
      return 'Disabled';
    }

    if (entry.selectedRoleId <= 0) {
      return 'Unassigned';
    }

    if (client.bulkRoleId > 0 && entry.selectedRoleId === client.bulkRoleId) {
      return 'Inherited';
    }

    return 'Custom';
  }

  getEntryStateClass(client: TeamAccessClientCard, entry: TeamAccessEntry): string {
    const label = this.getEntryStateLabel(client, entry).toLowerCase();
    if (label === 'custom') {
      return 'is-custom';
    }
    if (label === 'inherited') {
      return 'is-inherited';
    }
    if (label === 'unassigned') {
      return 'is-unassigned';
    }
    if (label === 'disabled' || label === 'no access') {
      return 'is-disabled';
    }
    return '';
  }

  private recomputeDirtyState() {
    this.entries = this.teamAccessClients.reduce((allEntries: TeamAccessEntry[], client: TeamAccessClientCard) => {
      allEntries.push(...client.entries);
      return allEntries;
    }, []);
    this.isDirty = this.createSnapshot(this.entries) !== this.initialSnapshot;
  }

  private buildMemberEntries(entries: TeamMemberOperationAccessEntry[]): TeamMemberAccessEntry[] {
    return (entries || [])
      .map(entry => ({
        operationId: entry.operationId,
        operationName: entry.operationName || 'Unnamed Operation',
        operationGroupId: entry.operationGroupId,
        operationGroupName: entry.operationGroupName || 'Other',
        operationActive: Number(entry.operationActive),
        selectedState: this.buildMemberSelectedState(entry),
        teamRoleLabel: entry.teamOperationUserRoleLabel || '',
        directRoleLabel: entry.directOperationUserRoleLabel || '',
        effectiveRoleLabel: entry.effectiveOperationUserRoleLabel || '',
        effectiveAccessSourceLabel: entry.effectiveAccessSourceLabel || ''
      }))
      .sort((left, right) => {
        const groupDifference = (left.operationGroupName || '').localeCompare(right.operationGroupName || '');
        if (groupDifference !== 0) {
          return groupDifference;
        }

        return (left.operationName || '').localeCompare(right.operationName || '');
      });
  }

  private buildMemberSelectedState(entry: TeamMemberOperationAccessEntry): string {
    if (entry.memberAccessMode === 'revoke') {
      return 'revoke';
    }

    if (entry.memberAccessMode === 'override' && Number(entry.memberOverrideOperationUserRoleLabelId) > 0) {
      return 'override:' + Number(entry.memberOverrideOperationUserRoleLabelId);
    }

    return 'default';
  }

  private groupEntries<TEntry extends { operationGroupName: string }>(entries: TEntry[]): TeamAccessGroup<TEntry>[] {
    const groups: Record<string, TEntry[]> = {};

    entries.forEach(entry => {
      if (!groups[entry.operationGroupName]) {
        groups[entry.operationGroupName] = [];
      }

      groups[entry.operationGroupName].push(entry);
    });

    return Object.keys(groups).map(groupName => ({
      groupName,
      entries: groups[groupName]
    }));
  }

  private createSnapshot(entries: TeamAccessEntry[]): string {
    const scopedAssignments = this.teamAccessClients
      .reduce((assignments, client: TeamAccessClientCard) => {
        client.entries.forEach((entry: TeamAccessEntry) => {
          if (!this.isEntryInClientScope(client, entry) || entry.selectedRoleId <= 0) {
            return;
          }

          assignments.push({
            operationId: entry.operationId,
            operationUserRoleLabelId: entry.selectedRoleId
          });
        });

        return assignments;
      }, [] as TeamOperationAssignmentPutItem[])
      .sort((left: TeamOperationAssignmentPutItem, right: TeamOperationAssignmentPutItem) =>
        left.operationId.localeCompare(right.operationId)
      );

    return JSON.stringify(scopedAssignments);
  }

  private createMemberSnapshot(entries: TeamMemberAccessEntry[]): string {
    return JSON.stringify(
      entries
        .filter(entry => entry.selectedState !== 'default')
        .map(entry => this.mapMemberEntryToPutItem(entry))
        .sort((left, right) => left.operationId.localeCompare(right.operationId))
    );
  }

  private mapMemberEntryToPutItem(entry: TeamMemberAccessEntry): TeamMemberOperationAccessPutItem {
    if (entry.selectedState === 'revoke') {
      return {
        operationId: entry.operationId,
        accessMode: 'revoke'
      };
    }

    const roleId = Number((entry.selectedState || '').split(':')[1]) || 0;
    return {
      operationId: entry.operationId,
      accessMode: 'override',
      operationUserRoleLabelId: roleId
    };
  }
}