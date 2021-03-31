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
  styleUrls: ['./team-members-listing.component.scss']
})
export class TeamMembersListingComponent implements OnInit {
  @Input() team: Team;
  user: User;
  public teamMembers: TeamMember[];
  public teamMembersFiltered: TeamMember[];
  public pageOfItems: Team[];
  public colDefs = ['Hired', 'Name', 'Position', 'Birthday', 'Languages'];
  public selectedSortOption = this.colDefs[0];
  public selectedSortFlag: string = 'desc';

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
  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
    this.runSortSwitch();
  }
  public runSortSwitch() {
    switch (this.selectedSortOption) {
      case 'Hired':
        break;
      case 'Name':
        this.sortTeamMembersByTeamMemberName(this.selectedSortFlag);
        break;
      case 'Position':
        this.sortTeamMembersByTeamMemberRole(this.selectedSortFlag);
        break;
    }
  }

  async postItModal(teamMember: TeamMember) {
    const modal = await this.modalController.create({
      component: PostItModalComponent,
      cssClass: 'followup-post-it-modal',
      componentProps: {
        modalType: 'Post A Note',
        teamMember: teamMember,
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

  searchTeamMembers($event: KeyboardEvent): TeamMember[] {
    let searchText = $event.currentTarget['value'];
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
}
