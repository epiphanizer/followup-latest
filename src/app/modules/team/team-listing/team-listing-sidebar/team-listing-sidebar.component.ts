import { Component, OnInit, Input } from '@angular/core';
import { formatDate } from '@angular/common';
import { Team, TeamMember } from '../../team';
import { User } from '@app/modules/user/user';
import { TeamService } from '../../team.service';
import { LogService } from '@app/shared/log/log.service';

@Component({
  providers: [LogService, TeamService],
  selector: 'app-team-listing-sidebar',
  templateUrl: './team-listing-sidebar.component.html',
  styleUrls: ['./team-listing-sidebar.component.scss']
})
export class TeamListingSidebar implements OnInit {
  primaryTeam: number = 1;
  isOpen: boolean = true;
  careRepTeamMembers: TeamMember[] = [];
  managerTeamMembers: TeamMember[] = [];
  spanishSpeakingTeamMembers: TeamMember[] = [];
  teamMembers: TeamMember[];
  todaysDateDay: number;
  @Input() team: Team;
  constructor(private logService: LogService, private teamService: TeamService) {}

  ngOnInit() {
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    /**
     * Until we add in more functionality to add teams, default to primaryTeam
     */
    this.teamService.getTeamMembersByTeamId(this.primaryTeam).subscribe((teamMembers: TeamMember[]) => {
      console.log(teamMembers);
      try {
        this.teamMembers = teamMembers;
        this.teamMembers.forEach((teamMember: TeamMember, index: number) => {
          if (teamMember.teamMemberRoleLabel == 'Manager') {
            this.managerTeamMembers.push(teamMember);
          }
          if (teamMember.teamMemberRoleLabel == 'Care Rep') {
            this.careRepTeamMembers.push(teamMember);
          }
          /**
           * Check for Spanish speaking
           */
          if (teamMember.spanishSpeaking) {
            this.spanishSpeakingTeamMembers.push(teamMember);
          }
        });
      } catch (error) {
        this.logService.log(error);
      }
    });
  }
}
