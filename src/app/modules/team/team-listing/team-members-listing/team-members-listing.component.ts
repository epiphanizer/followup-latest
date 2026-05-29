import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { map, take } from 'rxjs/operators';
import { TeamService } from '../../team.service';
import { Team, TeamMember } from '../../team';
import { PostItModalComponent } from '@app/shell/post-it-modal/post-it-modal.component';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';

@Component({
  selector: 'app-team-members-listing',
  templateUrl: './team-members-listing.component.html',
  styleUrls: ['./team-members-listing.component.scss'],
  standalone: false
})
export class TeamMembersListingComponent implements OnInit {
  @Input() team: Team;
  user: User;
  public teamMembers: TeamMember[];
  public teamMembersFiltered: TeamMember[];
  public pageOfItems: Team[];
  // asc or desc
  selectedSortFlag: string = 'asc';
  // column by which we will search
  cols: string[] = ['Hired', 'Name', 'Position', 'Birthday', 'Languages'];
  selectedSortOption: string = 'Position';

  constructor(
    private modalController: ModalController,
    private route: ActivatedRoute,
    private teamService: TeamService
  ) {}
  ngOnInit() {
    /**
     * Track current user for use in messaging
     */
    this.user = this.route.snapshot.data.user;
    this.teamMembers = [];
    this.teamService
      .getTeamMembersByTeamId(this.team.teamId)
      .pipe(
        take(1),
        map((teamMembers: [TeamMember]) => {
          this.teamMembers = teamMembers;
          this.teamMembersFiltered = teamMembers;
          this.runSortSwitch();
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: any) {
    if (changes.team) {
      this.teamMembers = [];
      this.team = changes.team.currentValue;
      this.teamService
        .getTeamMembersByTeamId(this.team.teamId)
        .pipe(
          take(1),
          map((teamMembers: [TeamMember]) => {
            if (teamMembers) {
              this.teamMembers = teamMembers;
              this.teamMembersFiltered = teamMembers;
              // this.sortTeamMembersByTeamMemberName(this.selectedSortFlag);
            } else {
              this.teamMembersFiltered = this.teamMembers = [];
            }
          })
        )
        .subscribe();
    }
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
}
