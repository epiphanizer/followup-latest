import { Component, OnInit, Input } from '@angular/core';
import { formatDate } from '@angular/common';
import { UserRoles } from '../../user';
import { TeamMember, Team } from '@app/modules/team/team';
import { LogService } from '@app/shared/log/log.service';
import { TeamService } from '@app/modules/team/team.service';

@Component({
  selector: 'app-user-profile-sidebar',
  templateUrl: './user-profile-sidebar.component.html',
  styleUrls: ['./user-profile-sidebar.component.scss']
})
export class UserProfileSidebarComponent implements OnInit {
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
