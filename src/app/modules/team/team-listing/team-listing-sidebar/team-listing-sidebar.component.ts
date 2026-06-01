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
  teams: Team[];
  todaysDateDay: string;
  selectedTeamId: string | null = null;
  @Input() team: Team;
  @Output() teamChangeEvent = new EventEmitter<Team>();
  constructor(private logService: LogService, private teamService: TeamService) {}

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.selectedTeamId = this.team?.teamId || null;
    this.teamService
      .getTeams()
      .pipe(
        take(1),
        map((teams: Team[]) => {
          this.teams = Array.isArray(teams) ? teams : [];
          if (this.teams?.length) {
            const initialTeam =
              this.teams.find((team: Team) => team.teamId === this.selectedTeamId) ||
              this.teams[0];
            this.selectedTeamId = initialTeam.teamId;
            this.teamChangeEvent.emit(initialTeam);
          }
          this.teams.forEach((team: Team) => {
            this.teamService.getTeamMembersByTeamId(team.teamId).subscribe((teamMembers: TeamMember[]) => {
              try {
                team.teamMembers = Array.isArray(teamMembers) ? teamMembers : [];
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

  ngOnChanges(changes: any) {
    if (changes.team && changes.team.currentValue) {
      this.selectedTeamId = changes.team.currentValue.teamId;
    }
  }

  selectTeam(team: Team) {
    this.selectedTeamId = team?.teamId || null;
    this.teamChangeEvent.emit(team);
  }

  getTeamMemberCount(team: Team): number {
    return Array.isArray(team?.teamMembers) ? team.teamMembers.length : 0;
  }

  isSelectedTeam(team: Team): boolean {
    return !!team?.teamId && team.teamId === this.selectedTeamId;
  }

  trackByTeam(index: number, team: Team): string | number {
    return team?.teamId || index;
  }

  trackByTeamMember(index: number, teamMember: TeamMember): string | number {
    return teamMember?.teamMemberId || teamMember?.userId || index;
  }
}
