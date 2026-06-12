import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';
import { formatDate } from '@angular/common';
import { Team, TeamMember } from '../../team';
import { TeamService } from '../../team.service';
import { LogService } from '@app/shared/log/log.service';
import { map, take } from 'rxjs/operators';

type TeamRoleGroupKey = 'admins' | 'managers' | 'careReps' | 'others';

@Component({
  providers: [LogService, TeamService],
  selector: 'app-team-listing-sidebar',
  templateUrl: './team-listing-sidebar.component.html',
  styleUrls: ['./team-listing-sidebar.component.scss'],
  animations: [
    trigger('expandSidebar', [
      state(
        'open',
        style({
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          opacity: 0
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.25s')])
    ]),
    trigger('turnArrow', [
      state(
        'open',
        style({
          transform: 'rotate(0deg)'
        })
      ),
      state(
        'closed',
        style({
          transform: 'rotate(-90deg)'
        })
      ),
      transition('open => closed', [animate('0.125s')]),
      transition('closed => open', [animate('0.125s')])
    ])
  ],
  standalone: false
})
export class TeamListingSidebar implements OnInit {
  teams: Team[];
  todaysDateDay: string;
  selectedTeamId: string | null = null;
  teamVisibilityFilter: 'active' | 'archived' = 'active';
  isBusy: boolean = false;
  private roleGroupLabels: { [key in TeamRoleGroupKey]: string } = {
    admins: 'Admins',
    managers: 'Managers',
    careReps: 'Care Reps',
    others: 'Other'
  };
  @Input() team: Team;
  @Input() canManageTeams: boolean = false;
  @Output() teamChangeEvent = new EventEmitter<Team | null>();
  constructor(private logService: LogService, private teamService: TeamService) {}

  get visibleTeams(): Team[] {
    const teams = Array.isArray(this.teams) ? this.teams : [];
    return teams.filter((team: Team) => {
      const isActive = Number(team?.teamActive) !== 0;
      return this.teamVisibilityFilter === 'archived' ? !isActive : isActive;
    });
  }

  get roleGroupKeys(): TeamRoleGroupKey[] {
    return ['admins', 'managers', 'careReps'];
  }

  get teamCounts(): { active: number; archived: number } {
    const teams = Array.isArray(this.teams) ? this.teams : [];
    return {
      active: teams.filter((team: Team) => Number(team?.teamActive) !== 0).length,
      archived: teams.filter((team: Team) => Number(team?.teamActive) === 0).length
    };
  }

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.selectedTeamId = this.team?.teamId || null;
    this.loadTeams(this.selectedTeamId);
  }

  private loadTeams(preferredTeamId?: string | null) {
    this.teamService
      .getTeams()
      .pipe(
        take(1),
        map((teams: Team[]) => {
          this.teams = Array.isArray(teams) ? teams : [];
          this.teams.forEach((team: Team) => {
            team.teamActive = Number(team?.teamActive) === 0 ? 0 : 1;
            this.ensureRoleGroupState(team);
          });

          if (this.teams?.length) {
            const initialTeam =
              this.teams.find((team: Team) => team.teamId === (preferredTeamId || this.selectedTeamId)) ||
              this.teams[0];
            this.selectedTeamId = initialTeam.teamId;
            this.teamChangeEvent.emit(initialTeam);
          }

          this.teams.forEach((team: Team) => {
            this.teamService.getTeamMembersByTeamId(team.teamId).subscribe((teamMembers: TeamMember[]) => {
              try {
                team.teamMembers = Array.isArray(teamMembers) ? teamMembers : [];
                this.ensureRoleGroupState(team);
              } catch (error) {
                this.logService.log(error);
              }
            });
          });
        })
      )
      .subscribe(() => {
        //
      });
  }

  ngOnChanges(changes: any) {
    if (changes.team && changes.team.currentValue) {
      this.selectedTeamId = changes.team.currentValue.teamId;
    }
  }

  selectTeam(team: Team | null) {
    this.selectedTeamId = team?.teamId || null;
    this.teamChangeEvent.emit(team);
  }

  setTeamVisibilityFilter(nextFilter: 'active' | 'archived') {
    if (this.teamVisibilityFilter === nextFilter) {
      return;
    }

    this.teamVisibilityFilter = nextFilter;
    const selectedTeam = this.teams.find((team: Team) => team.teamId === this.selectedTeamId) || null;
    if (!selectedTeam) {
      return;
    }

    const selectedVisible = this.visibleTeams.some((team: Team) => team.teamId === selectedTeam.teamId);
    if (selectedVisible) {
      return;
    }

    const fallbackTeam = this.visibleTeams[0] || null;
    if (fallbackTeam) {
      this.selectTeam(fallbackTeam);
      return;
    }

    this.selectedTeamId = null;
    this.teamChangeEvent.emit(null);
  }

  getRoleGroupLabel(roleGroupKey: TeamRoleGroupKey): string {
    return this.roleGroupLabels[roleGroupKey] || 'Members';
  }

  getRoleGroupMembers(team: Team, roleGroupKey: TeamRoleGroupKey): TeamMember[] {
    const members = Array.isArray(team?.teamMembers) ? team.teamMembers.slice() : [];
    return members
      .filter((teamMember: TeamMember) => this.getTopRoleGroup(teamMember) === roleGroupKey)
      .sort((a: TeamMember, b: TeamMember) => {
        const lastNameCompare = String(a?.teamMemberLastName || '').localeCompare(String(b?.teamMemberLastName || ''));
        if (lastNameCompare !== 0) {
          return lastNameCompare;
        }
        return String(a?.teamMemberFirstName || '').localeCompare(String(b?.teamMemberFirstName || ''));
      });
  }

  getRoleGroupCount(team: Team, roleGroupKey: TeamRoleGroupKey): number {
    return this.getRoleGroupMembers(team, roleGroupKey).length;
  }

  toggleRoleGroup(team: Team, roleGroupKey: TeamRoleGroupKey) {
    this.ensureRoleGroupState(team);
    team.roleGroupSidebarOpen[roleGroupKey] = !team.roleGroupSidebarOpen[roleGroupKey];
  }

  isRoleGroupExpanded(team: Team, roleGroupKey: TeamRoleGroupKey): boolean {
    this.ensureRoleGroupState(team);
    return !!team.roleGroupSidebarOpen[roleGroupKey];
  }

  private ensureRoleGroupState(team: Team) {
    if (!team) {
      return;
    }

    if (!team.roleGroupSidebarOpen) {
      team.roleGroupSidebarOpen = {
        admins: true,
        managers: true,
        careReps: true,
        others: false
      };
    }
  }

  private getTeamMemberRoleId(teamMember: TeamMember): number {
    const storedRoleId = Number(teamMember?.teamMemberRoleLabelId);
    if (storedRoleId === 1 || storedRoleId === 2 || storedRoleId === 3) {
      return storedRoleId;
    }

    const effectiveRoleId = Number(teamMember?.effectiveTeamMemberRoleLabelId);
    if (effectiveRoleId === 1 || effectiveRoleId === 2 || effectiveRoleId === 3) {
      return effectiveRoleId;
    }

    const roleLabel = String(teamMember?.teamMemberRoleLabel || '').toLowerCase();
    if (roleLabel.includes('admin')) {
      return 1;
    }
    if (roleLabel.includes('manager')) {
      return 2;
    }
    if (roleLabel.includes('care')) {
      return 3;
    }

    return 0;
  }

  private getTopRoleGroup(teamMember: TeamMember): TeamRoleGroupKey {
    const roleId = this.getTeamMemberRoleId(teamMember);
    if (roleId === 1) {
      return 'admins';
    }
    if (roleId === 2) {
      return 'managers';
    }
    if (roleId === 3) {
      return 'careReps';
    }
    return 'others';
  }

  createTeam() {
    if (!this.canManageTeams || this.isBusy) {
      return;
    }

    const teamName = window.prompt('New team name');
    if (!teamName || !teamName.trim()) {
      return;
    }

    this.isBusy = true;
    this.teamService.addTeam(teamName.trim()).subscribe(
      (createdTeam: Team) => {
        this.isBusy = false;
        this.loadTeams(createdTeam?.teamId || null);
      },
      () => {
        this.isBusy = false;
      }
    );
  }

  archiveTeam(team: Team, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canManageTeams || this.isBusy || !team?.teamId || Number(team?.teamActive) === 0) {
      return;
    }

    const shouldArchive = window.confirm(
      'Archive this team and cascade-remove team-based operation permissions? This keeps history and can be restored later.'
    );
    if (!shouldArchive) {
      return;
    }

    this.isBusy = true;
    this.teamService
      .deactivateTeamByTeamId(team.teamId, { teamName: team.teamName, cascadePermissions: true })
      .subscribe(
        () => {
          this.isBusy = false;
          team.teamActive = 0;
          if (this.teamVisibilityFilter === 'active') {
            const fallbackTeam = this.visibleTeams[0] || null;
            this.selectTeam(fallbackTeam || null);
          }
          this.loadTeams(this.selectedTeamId);
        },
        () => {
          this.isBusy = false;
        }
      );
  }

  renameTeam(team: Team, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canManageTeams || this.isBusy || !team?.teamId) {
      return;
    }

    const nextTeamName = window.prompt('Rename team', team.teamName || '');
    if (!nextTeamName || !nextTeamName.trim() || nextTeamName.trim() === team.teamName) {
      return;
    }

    this.isBusy = true;
    this.teamService
      .editTeamByTeamId(team.teamId, { teamName: nextTeamName.trim(), teamActive: Number(team.teamActive) === 0 ? 0 : 1 })
      .subscribe(
        () => {
          this.isBusy = false;
          team.teamName = nextTeamName.trim();
          this.loadTeams(team.teamId);
        },
        () => {
          this.isBusy = false;
        }
      );
  }

  restoreTeam(team: Team, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canManageTeams || this.isBusy || !team?.teamId || Number(team?.teamActive) !== 0) {
      return;
    }

    const shouldRestore = window.confirm('Restore this archived team?');
    if (!shouldRestore) {
      return;
    }

    this.isBusy = true;
    this.teamService.editTeamByTeamId(team.teamId, { teamName: team.teamName, teamActive: 1 }).subscribe(
      () => {
        this.isBusy = false;
        team.teamActive = 1;
        this.teamVisibilityFilter = 'active';
        this.selectTeam(team);
        this.loadTeams(team.teamId);
      },
      () => {
        this.isBusy = false;
      }
    );
  }

  getTeamMemberCount(team: Team): number {
    return Array.isArray(team?.teamMembers) ? team.teamMembers.length : 0;
  }

  isSelectedTeam(team: Team): boolean {
    return !!team?.teamId && team.teamId === this.selectedTeamId;
  }

  trackByTeam(index: number, team: Team): string | number {
    return team?.teamId || index;
  }

  trackByTeamMember(index: number, teamMember: TeamMember): string | number {
    return teamMember?.teamMemberId || teamMember?.userId || index;
  }
}
