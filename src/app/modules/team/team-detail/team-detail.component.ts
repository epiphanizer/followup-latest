import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { Team, TeamMember } from '@app/modules/team/team';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';
import { map, take } from 'rxjs/operators';

@Component({
  providers: [TeamService],
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamMemberDetailComponent implements OnInit {
  teamId: number;
  teamMemberId: number;
  teamMember: TeamMember;
  team: Team;
  public selected:
    | {
        teamMember: TeamMember;
        teamMember$: Observable<TeamMember>;
      }
    | any = {};
  constructor(private route: ActivatedRoute, private teamService: TeamService) {}

  ngOnInit() {
    this.teamId = this.route.snapshot.params.teamId;
    this.teamMemberId = this.route.snapshot.params.teamMemberId;
    this.teamService
      .getTeamMemberByTeamMemberId(this.teamId, this.teamMemberId)
      .pipe(
        take(1),
        map((teamMember: TeamMember) => {
          console.log(teamMember);
          this.teamMember = teamMember;
        })
      )
      .subscribe();
  }

  teamMemberChangeEventHandler($event: TeamMember) {
    if ($event) {
      this.teamMember = $event;
    }
  }

  postNote() {
    alert('posting note');
  }
}
