import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Operation } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';
import { Team, TeamOperationAssignment, TeamOperationAssignmentPutItem } from '@app/modules/team/team';
import { TeamService } from '@app/modules/team/team.service';

interface TeamAccessEntry {
  operationId: string;
  operationName: string;
  operationGroupId?: string;
  operationGroupName: string;
  operationActive?: number;
  selectedRoleId: number;
}

interface TeamAccessGroup {
  groupName: string;
  entries: TeamAccessEntry[];
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

  teamId: string;
  team: Team;
  isLoading: boolean = true;
  isSaving: boolean = false;
  isDirty: boolean = false;
  loadError: string = '';
  allOperations: Operation[] = [];
  entries: TeamAccessEntry[] = [];
  groupedEntries: TeamAccessGroup[] = [];
  private initialSnapshot: string = '[]';

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

  onRoleChange() {
    this.isDirty = this.createSnapshot(this.entries) !== this.initialSnapshot;
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
          this.toastrService.success('Team access successfully saved.');
        },
        error: () => {
          this.isSaving = false;
          this.toastrService.error('Could not save team access.');
        }
      });
  }

  private loadTeamAccess() {
    this.isLoading = true;
    this.isSaving = false;
    this.isDirty = false;
    this.loadError = '';

    forkJoin({
      teams: this.teamService.getTeams().pipe(take(1)),
      operations: this.operationService.getAllOperations().pipe(take(1)),
      assignments: this.teamService.getTeamOperationAssignmentsByTeamId(this.teamId).pipe(take(1))
    }).subscribe({
      next: result => {
        const teams = (result.teams || []) as Team[];
        const operations = (result.operations || []) as Operation[];
        const assignments = (result.assignments || []) as TeamOperationAssignment[];

        this.team = teams.find((team: Team) => team.teamId === this.teamId) || null;
        this.allOperations = operations;
        this.entries = this.buildEntries(this.allOperations, assignments);
        this.groupedEntries = this.groupEntries(this.entries);
        this.initialSnapshot = this.createSnapshot(this.entries);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'We had trouble loading the team access view.';
        this.isLoading = false;
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

  private groupEntries(entries: TeamAccessEntry[]): TeamAccessGroup[] {
    const groups: Record<string, TeamAccessEntry[]> = {};

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
}