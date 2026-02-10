import { Component, OnInit, Input } from '@angular/core';
import { User, UserRoles } from '@app/modules/user/user';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Team, TeamMember } from '@app/modules/team/team';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { TeamService } from '../team.service';
import { map, take } from 'rxjs/operators';
import { UserService } from '@app/modules/user/user.service';
import { PostItModalComponent } from '@app/shell/post-it-modal/post-it-modal.component';
import { SharedFunctions } from '@app/shared/shared.functions';
import { AuthenticationService } from '@app/core';
@Component({
  providers: [TeamService, SharedFunctions],
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamMemberDetailComponent implements OnInit {
  teamId: string;
  teamMemberId: string;
  teamMember: TeamMember;
  team: Team;
  currentUser: User;
  isImpersonating: boolean = false;
  userRoles = UserRoles;

  teamInfoDecoded: string;
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
    private router: Router,
    private teamService: TeamService,
    private userService: UserService,
    private sharedFunctions: SharedFunctions,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.currentUser = this.authenticationService.currentUserValue;
    this.isImpersonating = !!this.authenticationService.impersonatorValue;
    this.teamId = this.route.snapshot.params.teamId;
    this.teamMemberId = this.route.snapshot.params.teamMemberId;

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.teamMember = null;
      this.user = null;
      this.teamId = params.get('teamId');
      this.teamMemberId = params.get('teamMemberId');
      this.loadTeamMember();
    });
  }

  get canImpersonate(): boolean {
    return (
      this.currentUser &&
      this.currentUser.userLevel === this.userRoles.admin &&
      !this.isImpersonating &&
      !!this.teamMember?.userId
    );
  }

  loadTeamMember() {
    this.teamService
      .getTeamMemberByTeamIdAndTeamMemberId(this.teamId, this.teamMemberId)
      .pipe(
        take(1),
        map((teamMember: TeamMember) => {
          this.teamMember = teamMember;
          this.userService
            .getUserByUserId(this.teamMember.userId)
            .pipe(
              take(1),
              map((user: User) => {
                if (user !== null) {
                  this.user = user;
                  if (this.user.userAdditionalInfo) {
                    this.teamInfoDecoded = this.sharedFunctions.returnHTML(this.user.userAdditionalInfo);
                  }

                  this.user.userInterests = JSON.parse(this.user.userInterests);
                  // Write the switch
                  var val = '';
                  var i = 0;
                  var self = this;
                  if (this.user.userInterests) {
                    Object.entries(this.user.userInterests).forEach(([key, value], index) => {
                      switch (key) {
                        case 'celebrity':
                          val = 'Met favorite celebrity';
                          break;
                        case 'helicopter':
                          val = 'Flown in a helicopter';
                          break;
                        case 'kidney':
                          val = 'Donated a kidney';
                          break;
                        case 'skydivedOrBungeed':
                          val = 'Skydived or bungee jumped';
                          break;
                        case 'appearedOnTv':
                          val = 'Appeared on TV';
                          break;
                        case 'janeAusten':
                          val = 'Read Pride & Prejudice';
                          break;
                        case 'escargo':
                          val = 'Eaten Escargo';
                          break;
                        case 'deployed':
                          val = 'Been deployed';
                          break;
                        case 'instrument':
                          val = 'Play an instrument';
                          break;
                        case 'seenTornado':
                          val = 'Seen a tornado';
                          break;
                        case 'hitchhiked':
                          val = 'Hitchhiked';
                          break;
                        case 'DND':
                          val = 'Played Dungeons & Dragons';
                          break;
                      }
                      self.user.userInterests[index] = {
                        value: value,
                        nicename: val
                      };
                    });
                  }
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
        userMessage: {
          messageId: 0,
          messageBody: '',
          messageSenderUserId: this.user.userId,
          messageRecipientUserId: this.teamMember.userId
        }
      }
    });
    return await modal.present();
  }

  postNote() {
    this.postItModal();
  }

  loginAsUser() {
    if (!this.canImpersonate) {
      return;
    }
    const adminUser = this.currentUser;
    this.userService
      .impersonateUser(adminUser.userId, this.teamMember.userId)
      .pipe(take(1))
      .subscribe((user: User) => {
        if (!user) {
          return;
        }
        this.authenticationService.startImpersonation(user, adminUser).then(() => {
          this.router.navigate(['/home']);
        });
      });
  }
}
