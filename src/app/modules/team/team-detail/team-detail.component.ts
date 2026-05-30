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
import { OperationService } from '@app/modules/operation/operation.service';
import { PostItModalComponent } from '@app/shell/post-it-modal/post-it-modal.component';
import { SharedFunctions } from '@app/shared/shared.functions';
import { AuthenticationService } from '@app/core';
@Component({
  providers: [TeamService, SharedFunctions],
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
  standalone: false
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
  accessGroups: Array<{
    groupName: string;
    entries: Array<{
      operationName: string;
      roleLabel: string;
      sourceLabel: string;
      sourceDetail: string;
    }>;
  }> = [];
  filteredAccessGroups: Array<{
    groupName: string;
    entries: Array<{
      operationName: string;
      roleLabel: string;
      sourceLabel: string;
      sourceDetail: string;
    }>;
  }> = [];
  accessFilterOptions: string[] = ['All', 'Manager', 'Care Rep'];
  activeAccessFilter: string = 'All';
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
    private operationService: OperationService,
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
                  this.accessGroups = [];
                  this.filteredAccessGroups = [];
                  this.activeAccessFilter = 'All';
                  if (this.user.userAdditionalInfo) {
                    this.teamInfoDecoded = this.sharedFunctions.returnHTML(this.user.userAdditionalInfo);
                  }

                  this.user.userInterests = JSON.parse(this.user.userInterests);
                  this.loadAccessEntries();
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

  private loadAccessEntries() {
    if (!this.teamMember?.userId) {
      return;
    }
    this.operationService
      .getOperationsByUserId(this.teamMember.userId)
      .pipe(take(1))
      .subscribe((operations: Operation[]) => {
        if (!operations?.length) {
          this.accessGroups = [];
          this.filteredAccessGroups = [];
          this.activeAccessFilter = 'All';
          return;
        }
        const grouped: Record<
          string,
          Array<{ operationName: string; roleLabel: string; sourceLabel: string; sourceDetail: string }>
        > = {};
        operations.forEach(operation => {
          const groupName = operation.operationGroupName || 'Other';
          if (!grouped[groupName]) {
            grouped[groupName] = [];
          }
          const roleLabel = this.resolveRoleLabel(operation);
          if (!roleLabel) {
            return;
          }
          const sourceLabel = this.resolveAccessSourceLabel(operation);
          grouped[groupName].push({
            operationName: operation.operationName || 'Unnamed Operation',
            roleLabel,
            sourceLabel,
            sourceDetail: this.resolveAccessSourceDetail(operation)
          });
        });
        this.accessGroups = Object.keys(grouped)
          .sort((a, b) => a.localeCompare(b))
          .map(groupName => ({
            groupName,
            entries: grouped[groupName].sort((a, b) => a.operationName.localeCompare(b.operationName))
          }));
        this.applyAccessFilters();
      });
  }

  private resolveRoleLabel(operation: Operation | any): string | null {
    if (operation.userRoleLabel) {
      return this.normalizeRoleLabel(operation.userRoleLabel);
    }
    if (operation.operationUserRoleLabel) {
      return this.normalizeRoleLabel(operation.operationUserRoleLabel);
    }
    if (operation.operationUserRoleLabelId) {
      switch (Number(operation.operationUserRoleLabelId)) {
        case 1:
          return 'Admin';
        case 2:
          return 'Manager';
        case 3:
          return 'Care Rep';
        default:
          return null;
      }
    }
    return null;
  }

  private applyAccessFilters() {
    if (this.activeAccessFilter === 'All') {
      this.filteredAccessGroups = this.accessGroups;
      return;
    }
    this.filteredAccessGroups = this.accessGroups
      .map(group => ({
        groupName: group.groupName,
        entries: group.entries.filter(entry => entry.roleLabel === this.activeAccessFilter)
      }))
      .filter(group => group.entries.length);
  }

  setAccessFilter(role: string) {
    this.activeAccessFilter = role;
    this.applyAccessFilters();
  }

  private normalizeRoleLabel(roleLabel: string): string | null {
    const normalized = (roleLabel || '').toLowerCase();
    if (normalized.includes('manager')) {
      return 'Manager';
    }
    if (normalized.includes('care')) {
      return 'Care Rep';
    }
    if (normalized.includes('admin')) {
      return 'Admin';
    }
    return null;
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

  private resolveAccessSourceLabel(operation: Operation | any): string {
    const sourceLabel = (operation?.accessSourceLabel || '').trim();
    return sourceLabel || 'Direct';
  }

  private resolveAccessSourceDetail(operation: Operation | any): string {
    const details: string[] = [];

    const directRoleLabel = this.normalizeRoleLabel(operation?.directOperationUserRoleLabel || '');
    const inheritedRoleLabel = this.normalizeRoleLabel(operation?.inheritedOperationUserRoleLabel || '');

    if (directRoleLabel) {
      details.push('Direct: ' + directRoleLabel);
    }

    if (inheritedRoleLabel) {
      details.push('Team: ' + inheritedRoleLabel);
    }

    return details.join(' • ');
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
