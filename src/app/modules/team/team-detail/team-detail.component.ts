import { Component, OnInit } from '@angular/core';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { Team } from '@app/modules/team/team';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamMemberDetailComponent implements OnInit {
  team: Team;
  user: User;
  public selected:
    | {
        user: User;
        user$: Observable<User>;
      }
    | any = {};
  constructor(private route: ActivatedRoute, private teamService: TeamService) {}

  ngOnInit() {}
  teamMemberChangeEventHandler($event: Operation) {
    if (!this.selected.user) {
      this.selected.user = $event;
    } else {
      this.selected.user = $event;
      window.location.href = '/team/' + this.team.teamId + '/user/' + this.user.userId;
    }
  }
}
