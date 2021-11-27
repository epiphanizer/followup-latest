import { Component, OnInit, Input } from '@angular/core';
import { Team, TeamMember } from '@app/modules/team/team';
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
    this.teams = this.user.teams;
  }

  teamChangeEventHandler($event: Team) {
    this.selected.team = $event;
  }
}
