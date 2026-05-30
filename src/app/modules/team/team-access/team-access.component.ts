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

interface TeamAccessEntry {
  operationId: string;
  operationName: string;
  operationGroupId?: string;
  operationGroupName: string;
  operationActive?: number;
  selectedRoleId: number;
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
  groupedEntries: TeamAccessGroup<TeamAccessEntry>[] = [];
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
    return this.entries.filter(entry => entry.selectedRoleId > 0).length;
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

    return `Assigned ${this.assignedCount} of ${this.entries.length} operations.`;
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
    this.isDirty = this.createSnapshot(this.entries) !== this.initialSnapshot;
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

    const assignments: TeamOperationAssignmentPutItem[] = this.entries
      .filter(entry => entry.selectedRoleId > 0)
      .map(entry => ({
        operationId: entry.operationId,
        operationUserRoleLabelId: entry.selectedRoleId
      }));

    this.isSaving = true;
    this.teamService
      .setTeamOperationAssignmentsByTeamId(this.teamId, assignments)
      .pipe(take(1))
      .subscribe({
        next: (updatedAssignments: TeamOperationAssignment[]) => {
          this.entries = this.buildEntries(this.allOperations, updatedAssignments || []);
          this.groupedEntries = this.groupEntries(this.entries);
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
        this.groupedEntries = this.groupEntries(this.entries);
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
    return JSON.stringify(
      entries
        .filter(entry => entry.selectedRoleId > 0)
        .map(entry => ({
          operationId: entry.operationId,
          operationUserRoleLabelId: entry.selectedRoleId
        }))
        .sort((left, right) => left.operationId.localeCompare(right.operationId))
    );
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