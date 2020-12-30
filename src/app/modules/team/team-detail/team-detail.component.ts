import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { Team, TeamMember } from '@app/modules/team/team';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamMemberDetailComponent implements OnInit {
  teamMember: TeamMember;
  team: Team;
  public selected:
    | {
        teamMember: TeamMember;
        teamMember$: Observable<TeamMember>;
      }
    | any = {};
  constructor(private route: ActivatedRoute, private teamService: TeamService) {}

  ngOnInit() {}

  teamMemberChangeEventHandler($event: TeamMember) {
    if ($event) {
      this.teamMember = $event;
    }
  }

  postNote() {
    alert('posting note');
  }
}
