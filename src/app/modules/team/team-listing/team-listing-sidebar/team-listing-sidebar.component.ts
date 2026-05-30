import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';
import { formatDate } from '@angular/common';
import { Team, TeamMember } from '../../team';
import { TeamService } from '../../team.service';
import { LogService } from '@app/shared/log/log.service';
import { map, take } from 'rxjs/operators';

@Component({
  providers: [LogService, TeamService],
  selector: 'app-team-listing-sidebar',
  templateUrl: './team-listing-sidebar.component.html',
  styleUrls: ['./team-listing-sidebar.component.scss'],
  animations: [
    trigger('expandSidebar', [
      state(
        'open',
        style({
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          opacity: 0
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.25s')])
    ]),
    trigger('turnArrow', [
      state(
        'open',
        style({
          transform: 'rotate(0deg)'
        })
      ),
      state(
        'closed',
        style({
          transform: 'rotate(-90deg)'
        })
      ),
      transition('open => closed', [animate('0.125s')]),
      transition('closed => open', [animate('0.125s')])
    ])
  ],
  standalone: false
})
export class TeamListingSidebar implements OnInit {
  primaryTeam: number = 1;
  isOpen: boolean = true;
  careRepTeamMembers: TeamMember[] = [];
  managerTeamMembers: TeamMember[] = [];
  spanishSpeakingTeamMembers: TeamMember[] = [];
  teams: Team[];
  teamMembers: TeamMember[];
  todaysDateDay: string;
  @Input() team: Team;
  @Output() teamChangeEvent = new EventEmitter<Team>();
  constructor(private logService: LogService, private teamService: TeamService) {}

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.teamService
      .getTeams()
      .pipe(
        take(1),
        map((teams: Team[]) => {
          this.teams = teams;
          if (this.teams?.length) {
            this.teamChangeEvent.emit(this.teams[0]);
          }
          this.teams.forEach((team: Team) => {
            this.teamService.getTeamMembersByTeamId(team.teamId).subscribe((teamMembers: TeamMember[]) => {
              try {
                /**
                 * Initiate local team variables
                 */
                team.teamMembers = teamMembers;
                team.teamManagers = [];
                team.teamCareReps = [];
                team.teamSpanishSpeaking = [];
                /**
                 * Set defaults on the sidebar collapse states for each team
                 */
                team.teamManagerSidebarDropdownOpen = false;
                team.teamCareRepSidebarDropdownOpen = false;
                team.teamSpanishSidebarDropdownOpen = false;
                teamMembers.forEach((teamMember: TeamMember, index: number) => {
                  if (teamMember.teamMemberRoleLabel == 'Manager') {
                    team.teamManagers.push(teamMember);
                  }
                  if (teamMember.teamMemberRoleLabel == 'Care Rep') {
                    team.teamCareReps.push(teamMember);
                  }
                  /**
                   * Check for Spanish speaking
                   */
                  if (teamMember.spanishSpeaking) {
                    team.teamSpanishSpeaking.push(teamMember);
                  }
                });
              } catch (error) {
                this.logService.log(error);
              }
            });
          });
        })
      )
      .subscribe(() => {
        //
      });
  }
  toggleTeamManagerSidebarMenu(team: Team) {
    team.teamManagerSidebarDropdownOpen = !team.teamManagerSidebarDropdownOpen;
  }
  toggleTeamCareRepSidebarMenu(team: Team) {
    team.teamCareRepSidebarDropdownOpen = !team.teamCareRepSidebarDropdownOpen;
  }
  toggleTeamSpanishSidebarMenu(team: Team) {
    team.teamSpanishSidebarDropdownOpen = !team.teamSpanishSidebarDropdownOpen;
  }

  selectTeam(team: Team) {
    this.teamChangeEvent.emit(team);
  }

  trackByTeam(index: number, team: Team): string | number {
    return team?.teamId || index;
  }

  trackByTeamMember(index: number, teamMember: TeamMember): string | number {
    return teamMember?.teamMemberId || teamMember?.userId || index;
  }
}
