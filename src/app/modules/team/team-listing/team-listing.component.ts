import { Component, OnInit, Input } from '@angular/core';
import { Team } from '@app/modules/team/team';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '@app/modules/team/team.service';

@Component({
  providers: [TeamService],
  selector: 'app-team-listing',
  templateUrl: './team-listing.component.html',
  styleUrls: ['./team-listing.component.scss']
})
export class TeamListingComponent implements OnInit {
  @Input() team: Team;
  filterBy: string;
  // asc or desc
  selectedSortFlag: string;
  // column by which we will search
  selectedSortOption: string;
  public teams: Team[];
  public teams$: Observable<[Team]> | void = null;
  public selected:
    | {
        filterDate: string;
        team: Team;
        team$: Observable<Team>;
      }
    | any = {};

  user: User;
  constructor(private teamService: TeamService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.teams$ = this.teamService.getTeams().pipe(
      map((teams: [Team]) => {
        this.teams = teams;
        this.selected.team = teams[0];
        return teams;
      })
    );
  }
  // We get passsed asc or desc back from event emitter
  toggleAscDesc($event: string) {
    this.selectedSortFlag = $event;
    this.runSortSwitch();
  }

  runSortSwitch() {
    console.log('in sort switch, sorting by ' + this.selectedSortFlag);
    switch (this.selectedSortOption) {
      case 'Hired':
        // this.sortTeam(this.selectedSortFlag);
        break;
      case 'Name':
      // this.sortPatientsByPatientName(this.selectedSortFlag);
      // break;
      case 'Position':
      // this.sortPatientsByPatientRecordNumber(this.selectedSortFlag);
      // break;
      case 'Birthday':
      // this.sortPatientsByPatientStatus(this.selectedSortFlag);
      // break;
      case 'Languages':
      // this.sortPatientsByPatientStatus(this.selectedSortFlag);
      // break;
    }
  }
  // searchTeamMembersByTeam($event: KeyboardEvent): Team[] {
  //   let searchText = $event.currentTarget['value'];
  //   searchText = searchText.toLowerCase();
  //   this.teams = this.teams.filter((team: Team) => {
  //     let teamName = team.teamName;
  //     return teamName.toLowerCase().includes(searchText);
  //   });
  //   return this.teams;
  // }
  teamChangeEventHandler($event: Team) {
    this.selected.team = $event;
    this.teams = [];
    this.teams$ = this.teamService.getTeamMembersByTeamId(this.selected.team.teamId).pipe(
      map((teams: [Team]) => {
        console.log(teams);
        this.teams = teams;
        return teams;
      })
    );
  }
}
