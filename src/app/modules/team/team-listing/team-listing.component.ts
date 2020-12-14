import { Component, OnInit, Input } from '@angular/core';
import { Team } from '@app/modules/team/team';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '@app/modules/team/team.service';

@Component({
  providers: [TeamService],
  selector: 'app-team-listing',
  templateUrl: './team-listing.component.html',
  styleUrls: ['./team-listing.component.scss']
})
export class TeamListingComponent implements OnInit {
  @Input() team: Team;
  filterBy: string;
  public teams: Team[];
  public teams$: Observable<[Team]> | void = null;
  public selected:
    | {
        filterDate: string;
        team: Team;
        team$: Observable<Team>;
      }
    | any = {};
  selectedSortFlag: string = 'asc';
  user: User;
  constructor(private teamService: TeamService, private route: ActivatedRoute) {}

  ngOnInit() {}

  teamChangeEventHandler($event: Team) {
    this.selected.team = $event;
    this.teams = [];
    this.teams$ = this.teamService.getTeamMembersByTeamId(this.selected.team.teamId).pipe(
      map((teams: [Team]) => {
        this.teams = teams;
        return teams;
      })
    );
  }
}
