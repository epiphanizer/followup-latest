import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Team, TeamMember } from '@app/modules/team/team';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';
import { map, take } from 'rxjs/operators';
import { UserService } from '@app/modules/user/user.service';
import { PostItModalComponent } from '@app/shell/post-it-modal/post-it-modal.component';

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
  constructor(
    private modalController: ModalController,
    private route: ActivatedRoute,
    private teamService: TeamService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.teamId = this.route.snapshot.params.teamId;
    this.teamMemberId = this.route.snapshot.params.teamMemberId;

    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log('here');
      this.teamMember = null;
      this.user = null;
      this.teamId = parseInt(params.get('teamId'));
      this.teamMemberId = parseInt(params.get('teamMemberId'));
      this.loadTeamMember();
    });
  }
  loadTeamMember() {
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
  async postItModal() {
    const modal = await this.modalController.create({
      component: PostItModalComponent,
      cssClass: 'followup-post-it-modal',
      componentProps: {
        modalType: 'Post A Note',
        teamMember: this.teamMember,
        teamMessage: {
          teamMessageId: 0,
          teamMessageContent: '',
          teamMessageRecipientId: this.teamMember.teamMemberId
        }
      }
    });
    return await modal.present();
  }

  postNote() {
    this.postItModal();
  }
}
