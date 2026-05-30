import { Component, OnInit, Input } from '@angular/core';
import { Team, TeamMember } from '@app/modules/team/team';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRoles } from '@app/modules/user/user';
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

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.teams = this.user.teams || [];
    this.setSelectedTeam(this.route.snapshot.params.teamId);

    this.route.paramMap.subscribe(params => {
      this.setSelectedTeam(params.get('teamId'));
    });
  }

  teamChangeEventHandler($event: Team) {
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
