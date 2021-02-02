import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { Team, TeamMember } from '@app/modules/team/team';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';
import { map, take } from 'rxjs/operators';
import { UserService } from '@app/modules/user/user.service';

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
  /**
   * We assign user interests here out of a JSON string
   */
  userInterests: any;
  /**
   * get the user object for our user-avatar
   */
  user: User;
  public selected:
    | {
        teamMember: TeamMember;
        teamMember$: Observable<TeamMember>;
      }
    | any = {};
  constructor(private route: ActivatedRoute, private teamService: TeamService, private userService: UserService) {}

  ngOnInit() {
    this.teamId = this.route.snapshot.params.teamId;
    this.teamMemberId = this.route.snapshot.params.teamMemberId;
    this.teamService
      .getTeamMemberByTeamIdAndTeamMemberId(this.teamId, this.teamMemberId)
      .pipe(
        take(1),
        map((teamMember: TeamMember) => {
          this.teamMember = teamMember[0];
          this.userService
            .getUserByUserId(this.teamMember.userId)
            .pipe(
              take(1),
              map((user: User) => {
                if (user !== null) {
                  this.user = user;
                  this.user.userInterests = JSON.parse(this.user.userInterests);
                } else {
                  throw "Something went wrong, couldn't find user!";
                }
              })
            )
            .subscribe();
        })
      )
      .subscribe();
  }

  teamMemberChangeEventHandler($event: TeamMember) {
    if ($event) {
      this.teamMember = $event;
      this.teamMemberId = $event.teamMemberId;
      this.teamService
        .getTeamMemberByTeamIdAndTeamMemberId(this.teamId, this.teamMemberId)
        .pipe(
          take(1),
          map((teamMember: TeamMember) => {
            this.teamMember = teamMember[0];
            this.userService
              .getUserByUserId(this.teamMember.userId)
              .pipe(
                take(1),
                map((user: User) => {
                  if (user !== null) {
                    this.user = user;
                    this.user.userInterests = JSON.parse(this.user.userInterests);
                  } else {
                    throw "Something went wrong, couldn't find user!";
                  }
                })
              )
              .subscribe();
          })
        )
        .subscribe();
    }
  }

  postNote() {
    alert('posting note');
  }
}
