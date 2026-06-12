import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { map, take } from 'rxjs/operators';
import { TeamService } from '../../team.service';
import { Team, TeamMember } from '../../team';
import { PostItModalComponent } from '@app/shell/post-it-modal/post-it-modal.component';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';

@Component({
  selector: 'app-team-members-listing',
  templateUrl: './team-members-listing.component.html',
  styleUrls: ['./team-members-listing.component.scss'],
  standalone: false
})
export class TeamMembersListingComponent implements OnInit {
  @Input() team: Team;
  @Input() canManageTeams: boolean = false;
  user: User;
  public teamMembers: TeamMember[];
  public teamMembersFiltered: TeamMember[];
  public availableUsers: User[] = [];
  public availableUsersFiltered: User[] = [];
  public pageOfItems: Team[];
  addMemberSearchText: string = '';
  isAddMemberModalOpen: boolean = false;
  isAddMemberBusy: boolean = false;
  removingUserId: string | null = null;
  // asc or desc
  selectedSortFlag: string = 'asc';
  // column by which we will search
  cols: string[] = ['Hired', 'Name', 'Position', 'Birthday', 'Languages'];
  selectedSortOption: string = 'Position';

  constructor(
    private modalController: ModalController,
    private route: ActivatedRoute,
    private teamService: TeamService,
    private userService: UserService
  ) {}
  ngOnInit() {
    /**
     * Track current user for use in messaging
     */
    this.user = this.route.snapshot.data.user;
    this.teamMembers = [];
    this.reloadTeamMembers();
  }

  ngOnChanges(changes: any) {
    if (changes.team) {
      this.teamMembers = [];
      this.team = changes.team.currentValue;
      this.closeAddMemberModal();
      this.reloadTeamMembers();
    }
  }

  private reloadTeamMembers() {
    if (!this.team?.teamId) {
      this.teamMembersFiltered = this.teamMembers = [];
      return;
    }

    this.teamService
      .getTeamMembersByTeamId(this.team.teamId)
      .pipe(
        take(1),
        map((teamMembers: [TeamMember]) => {
          if (teamMembers) {
            this.teamMembers = teamMembers;
            this.teamMembersFiltered = teamMembers;
            this.team.teamMembers = teamMembers;
            this.runSortSwitch();
          } else {
            this.team.teamMembers = [];
            this.teamMembersFiltered = this.teamMembers = [];
          }
          this.refreshAvailableUsers();
        })
      )
      .subscribe();
  }

  openAddMemberModal() {
    if (!this.canManageTeams || !this.team?.teamId || this.isAddMemberBusy) {
      return;
    }

    this.isAddMemberModalOpen = true;
    this.addMemberSearchText = '';

    if (this.availableUsers.length) {
      this.refreshAvailableUsers();
      return;
    }

    this.isAddMemberBusy = true;
    this.userService
      .getActiveUsers()
      .pipe(take(1))
      .subscribe(
        (users: User[]) => {
          this.isAddMemberBusy = false;
          this.availableUsers = Array.isArray(users) ? users : [];
          this.refreshAvailableUsers();
        },
        () => {
          this.isAddMemberBusy = false;
          this.availableUsers = [];
          this.availableUsersFiltered = [];
        }
      );
  }

  closeAddMemberModal() {
    this.isAddMemberModalOpen = false;
    this.addMemberSearchText = '';
    this.availableUsersFiltered = [];
  }

  updateAddMemberSearch(searchText: string) {
    this.addMemberSearchText = String(searchText || '');
    this.refreshAvailableUsers();
  }

  private refreshAvailableUsers() {
    const memberIds = new Set((this.teamMembers || []).map((teamMember: TeamMember) => String(teamMember?.userId || '')));
    const searchText = this.addMemberSearchText.trim().toLowerCase();

    this.availableUsersFiltered = (this.availableUsers || [])
      .filter((candidate: User) => {
        if (!candidate?.userId || memberIds.has(String(candidate.userId))) {
          return false;
        }

        if (!searchText) {
          return true;
        }

        const haystack = [
          candidate.userFirstName,
          candidate.userLastName,
          candidate.userEmail,
          candidate.username,
          candidate.userRoleLabel
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchText);
      })
      .sort((a: User, b: User) => {
        const lastNameCompare = String(a?.userLastName || '').localeCompare(String(b?.userLastName || ''));
        if (lastNameCompare !== 0) {
          return lastNameCompare;
        }
        return String(a?.userFirstName || '').localeCompare(String(b?.userFirstName || ''));
      });
  }

  addTeamMember(userToAdd: User) {
    if (!this.team?.teamId || !userToAdd?.userId || this.isAddMemberBusy) {
      return;
    }

    this.isAddMemberBusy = true;
    this.teamService
      .addTeamMemberByTeamIdAndUserId(this.team.teamId, userToAdd.userId)
      .pipe(take(1))
      .subscribe(
        () => {
          this.isAddMemberBusy = false;
          this.closeAddMemberModal();
          this.reloadTeamMembers();
        },
        () => {
          this.isAddMemberBusy = false;
        }
      );
  }

  removeTeamMember(teamMember: TeamMember, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.canManageTeams || !this.team?.teamId || !teamMember?.teamMemberId || !teamMember?.userId || this.removingUserId) {
      return;
    }

    const shouldRemove = window.confirm(
      `Remove ${teamMember.teamMemberFirstName || ''} ${teamMember.teamMemberLastName || ''} from ${this.team?.teamName || 'this team'}?`
        .replace(/\s+/g, ' ')
        .trim()
    );
    if (!shouldRemove) {
      return;
    }

    this.removingUserId = teamMember.userId;
    this.teamService
      .removeTeamMemberByTeamIdAndTeamMemberId(this.team.teamId, teamMember.teamMemberId)
      .pipe(take(1))
      .subscribe(
        () => {
          this.removingUserId = null;
          this.reloadTeamMembers();
        },
        () => {
          this.removingUserId = null;
        }
      );
  }

  isRemovingTeamMember(teamMember: TeamMember): boolean {
    return !!teamMember?.userId && this.removingUserId === teamMember.userId;
  }

  getAvailableUserRoleLabel(user: User): string {
    return user?.userRoleLabel || user?.operationUserRoleLabel || 'Team member';
  }

  getAvailableUserDisplayName(user: User): string {
    return [user?.userFirstName, user?.userLastName].filter(Boolean).join(' ') || user?.username || 'User';
  }

  handleSearchFilterEvent($event: string) {
    this.searchTeamMembers($event);
  }

  handleSortDirectionEvent($event: string) {
    this.selectedSortFlag = $event;
    this.runSortSwitch();
  }

  handleSortOptionEvent($event: string) {
    this.selectedSortOption = $event;
    this.runSortSwitch();
  }
  // We get passsed asc or desc back from event emitter
  toggleAscDesc($event: string) {
    this.selectedSortFlag = $event;
    this.runSortSwitch();
  }

  runSortSwitch() {
    switch (this.selectedSortOption) {
      case 'Hired':
        this.sortTeamByTeamMemberHiredDate();
        break;
      case 'Name':
        this.sortTeamByTeamMemberName();
        break;
      case 'Position':
        this.sortTeamByTeamMemberPosition();
        break;
      case 'Birthday':
        this.sortTeamByTeamMemberBirthday();
        break;
      case 'Languages':
        this.sortTeamByTeamMemberLanguages();
        break;
    }
  }

  sortTeamByTeamMemberHiredDate = function() {
    if (this.selectedSortFlag == 'desc') {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>new Date(a.teamMemberHired) - <any>new Date(b.teamMemberHired);
        })
        .slice();
    } else {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>new Date(b.teamMemberHired) - <any>new Date(a.teamMemberHired);
        })
        .slice();
    }
  };
  sortTeamByTeamMemberName = function() {
    if (this.selectedSortFlag == 'desc') {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>(
            (a.teamMemberFirstName + a.teamMemberLastName).localeCompare(b.teamMemberFirstName + b.teamMemberLastName)
          );
        })
        .slice();
    } else {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>(
            (b.teamMemberFirstName + b.teamMemberLastName).localeCompare(a.teamMemberFirstName + a.teamMemberLastName)
          );
        })
        .slice();
    }
  };
  sortTeamByTeamMemberPosition = function() {
    const getRank = (roleLabel?: string) => {
      const role = (roleLabel || '').toLowerCase();
      if (role.includes('admin')) {
        return 0;
      }
      if (role.includes('manager')) {
        return 1;
      }
      if (role.includes('care')) {
        return 2;
      }
      return 3;
    };
    const sortDirection = this.selectedSortFlag == 'desc' ? -1 : 1;
    this.teamMembersFiltered = this.teamMembers
      .sort((a: TeamMember, b: TeamMember) => {
        const rankDiff = (getRank(a.teamMemberRoleLabel) - getRank(b.teamMemberRoleLabel)) * sortDirection;
        if (rankDiff !== 0) {
          return rankDiff;
        }
        const lastNameDiff = (a.teamMemberLastName || '').localeCompare(b.teamMemberLastName || '');
        if (lastNameDiff !== 0) {
          return lastNameDiff;
        }
        return (a.teamMemberFirstName || '').localeCompare(b.teamMemberFirstName || '');
      })
      .slice();
  };
  sortTeamByTeamMemberBirthday = function() {
    if (this.selectedSortFlag == 'desc') {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>new Date(a.teamMemberBirthday) - <any>new Date(b.teamMemberBirthday);
        })
        .slice();
    } else {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>new Date(b.teamMemberBirthday) - <any>new Date(a.teamMemberBirthday);
        })
        .slice();
    }
  };

  sortTeamByTeamMemberLanguages = function() {
    if (this.selectedSortFlag == 'desc') {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>(b.spanishSpeaking ? 1 : 0) - (a.spanishSpeaking ? 1 : 0);
        })
        .slice();
    } else {
      this.teamMembersFiltered = this.teamMembers
        .sort((a: TeamMember, b: TeamMember) => {
          return <any>(a.spanishSpeaking ? 1 : 0) - (b.spanishSpeaking ? 1 : 0);
        })
        .slice();
    }
  };
  async postItModal(teamMember: TeamMember) {
    const modal = await this.modalController.create({
      component: PostItModalComponent,
      cssClass: 'followup-post-it-modal',
      componentProps: {
        modalType: 'Post A Note',
        teamMember: teamMember,
        teamId: this.team.teamId,
        userMessage: {
          messageId: 0,
          messageBody: '',
          messageSenderUserId: this.user.userId,
          messageRecipientUserId: teamMember.userId
        }
      }
    });
    return await modal.present();
  }

  postNote(teamMember: TeamMember) {
    this.postItModal(teamMember);
  }
  sortTeamMembersByTeamMemberName = function(sortFlag: string) {
    this.filterBy = 'team-member-name';
    if (sortFlag == 'desc') {
      this.teamMembersFiltered = this.teams
        .sort((a: TeamMember, b: TeamMember) => {
          return a.teamMemberFirstName.localeCompare(b.teamMemberFirstName);
        })
        .slice();
    } else {
      this.teamMembersFiltered = this.teams
        .sort((a: TeamMember, b: TeamMember) => {
          return b.teamMemberFirstName.localeCompare(a.teamMemberFirstName);
        })
        .slice();
    }
  };
  sortTeamMembersByTeamMemberRole = function(sortFlag: string) {
    this.filterBy = 'team-member-role';
    if (sortFlag == 'desc') {
      this.teamMembersFiltered = this.teams
        .sort((a: TeamMember, b: TeamMember) => {
          return a.teamMemberRoleLabel.localeCompare(b.teamMemberRoleLabel);
        })
        .slice();
    } else {
      this.teamMembersFiltered = this.teams
        .sort((a: TeamMember, b: TeamMember) => {
          return b.teamMemberRoleLabel.localeCompare(a.teamMemberRoleLabel);
        })
        .slice();
    }
  };

  searchTeamMembers($event: string): TeamMember[] {
    let searchText = $event;
    searchText = searchText.toLowerCase();
    this.teamMembersFiltered = this.teamMembers.filter((team: TeamMember) => {
      let teamMemberFullName = team.teamMemberFirstName + ' ' + team.teamMemberLastName;
      return teamMemberFullName.toLowerCase().includes(searchText);
    });
    return this.teamMembersFiltered;
  }
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  trackByTeamMember(index: number, teamMember: TeamMember): string | number {
    return teamMember?.teamMemberId || teamMember?.userId || index;
  }

  trackByAvailableUser(index: number, user: User): string | number {
    return user?.userId || index;
  }
}
