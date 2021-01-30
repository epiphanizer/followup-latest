import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { map, take } from 'rxjs/operators';
import { TeamService } from '../../team.service';
import { Team, TeamMember } from '../../team';

@Component({
  selector: 'app-team-members-listing',
  templateUrl: './team-members-listing.component.html',
  styleUrls: ['./team-members-listing.component.scss']
})
export class TeamMembersListingComponent implements OnInit {
  @Input() team: Team;
  public teamMembers: TeamMember[];
  public teamMembersFiltered: TeamMember[];
  public pageOfItems: Team[];
  public filterBy: string = 'team-date';
  public selectedSortFlag: string = 'desc';

  constructor(private teamService: TeamService) {}
  ngOnInit() {
    this.teamMembers = [];
    this.teamService
      .getTeamByTeamId(this.team.teamId)
      .pipe(
        take(1),
        map((teamMembers: [TeamMember]) => {
          this.teamMembers = teamMembers;
          this.teamMembersFiltered = teamMembers;
          this.sortTeamMembersByTeamMemberName(this.selectedSortFlag);
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: any) {
    // if (changes.team) {
    //   this.teamMembers = [];
    //   this.team = changes.team.currentValue;
    //   this.teamService
    //     .getTeamMembersByTeamId(this.team.teamId)
    //     .pipe(
    //       take(1),
    //       map((teamMembers: [TeamMember]) => {
    //         if (teamMembers) {
    //           this.teamMembers = teamMembers;
    //           this.teamMembersFiltered = teamMembers;
    //           this.sortTeamMembersByTeamMemberName(this.selectedSortFlag);
    //         } else {
    //           this.teamMembersFiltered = this.teamMembers = [];
    //         }
    //       })
    //     )
    //     .subscribe();
    // }
  }
  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
    if (this.filterBy == 'team-member-name') {
      this.sortTeamMembersByTeamMemberName(this.selectedSortFlag);
    }
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

  searchTeams($event: KeyboardEvent): TeamMember[] {
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
