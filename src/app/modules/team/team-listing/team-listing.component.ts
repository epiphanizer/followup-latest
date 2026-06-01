import { Component, OnInit, Input } from '@angular/core';
import { Team, TeamMember } from '@app/modules/team/team';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRoles, UserRolesMap } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '@app/modules/team/team.service';

@Component({
  providers: [TeamService],
  selector: 'app-team-listing',
  templateUrl: './team-listing.component.html',
  styleUrls: ['./team-listing.component.scss'],
  standalone: false
})
export class TeamListingComponent implements OnInit {
  @Input() team: Team;
  userRoles = UserRoles;
  public teams: Team[];
  public teams$: Observable<[Team]> | void = null;
  public selected:
    | {
        filterDate: string;
        team: Team;
        team$: Observable<Team>;
      }
    | any = {};

  user: User;
  constructor(private route: ActivatedRoute) {}

  get selectedTeamName(): string {
    return this.selected?.team?.teamName || 'Team';
  }

  get selectedTeamMemberCount(): number {
    return Array.isArray(this.selected?.team?.teamMembers) ? this.selected.team.teamMembers.length : 0;
  }

  get selectedTeamIsArchived(): boolean {
    return Number(this.selected?.team?.teamActive) === 0;
  }

  get selectedTeamMembersLink(): any[] {
    return ['/teams', this.selected?.team?.teamId];
  }

  get selectedTeamAccessLink(): any[] {
    return ['/teams', this.selected?.team?.teamId, 'access'];
  }

  get canManageTeamAccess(): boolean {
    const userLevel =
      typeof this.user?.userLevel === 'number'
        ? this.user.userLevel
        : (UserRolesMap as any)[String(this.user?.userLevel)] || 0;
    return !!this.selected?.team?.teamId && userLevel === (UserRolesMap as any)[UserRoles.admin];
  }

  get canManageTeams(): boolean {
    const userLevel =
      typeof this.user?.userLevel === 'number'
        ? this.user.userLevel
        : (UserRolesMap as any)[String(this.user?.userLevel)] || 0;
    return userLevel === (UserRolesMap as any)[UserRoles.admin];
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.teams = this.user.teams || [];
    this.setSelectedTeam(this.route.snapshot?.params?.teamId || null);

    this.route.paramMap.subscribe(params => {
      this.setSelectedTeam(params.get('teamId'));
    });
  }

  teamChangeEventHandler($event: Team | null) {
    this.selected.team = $event;
  }

  private setSelectedTeam(teamId?: string | null) {
    if (!this.teams?.length) {
      this.selected.team = null;
      return;
    }

    this.selected.team = this.teams.find(team => team.teamId === teamId) || this.teams[0];
  }
}
