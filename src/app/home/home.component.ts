import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserMessage } from '@app/modules/user/user';
import { TeamMessage } from '@app/modules/team/team';
import { UserService } from '@app/modules/user/user.service';
import { TeamService } from '@app/modules/team/team.service';
import { SharedFunctions } from '@app/shared/shared.functions';

@Component({
  providers: [UserService, SharedFunctions],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  todaysCallsProgress: number;
  weeklyCallsProgress: number;
  callsMadeProgress: number;
  notificationsProgress: number;
  todaysCalls: any = {
    completed: 0,
    scheduled: 0
  };
  weeklyCalls: any = {
    completed: 0,
    scheduled: 0
  };

  callsMade: any = {
    callsMade: 0,
    totalCalls: 0
  };
  notificationsSent: any = {
    notifications: 0,
    totalNotifications: 0
  };

  public teamMessage: TeamMessage;
  public userMessage: UserMessage;
  public user: User;
  public menu: {}[] = [{}];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedFunctions: SharedFunctions,
    private teamService: TeamService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.teamService.getTeamMessagesByTeamId(1).subscribe((teamMessages: TeamMessage[]) => {
      if (teamMessages) {
        this.teamMessage = teamMessages[0];
        // Decode our message to preserve line breaks, other symbols.
        this.teamMessage.messageBody = this.sharedFunctions.returnHTML(this.teamMessage.messageBody);
      }

      this.teamService.getTeamTotals().subscribe((data: any) => {
        if (data.length) {
          this.callsMade.totalCalls = data[0].totalCalls;
          this.notificationsSent.totalNotifications = data[0].totalNotifications;
        }
        this.userService.getUserMessages(this.user).subscribe((userMessages: UserMessage[]) => {
          if (userMessages) {
            this.userMessage = userMessages[0];
            this.userMessage.messageBody = this.sharedFunctions.returnHTML(this.userMessage.messageBody);
          }

          /**
           * Data dashboard calls
           */
          this.userService.getUserCallCount(this.user).subscribe((data: any) => {
            if (data.length) {
              this.todaysCalls.completed = data[0].todaysCompletedCalls;
              this.todaysCalls.scheduled = data[0].todaysScheduledCalls;
              this.weeklyCalls.completed = data[0].weeklyCompletedCalls;
              this.weeklyCalls.scheduled = data[0].weeklyScheduledCalls;
              this.callsMade.callsMade = data[0].totalCalls;
            }
            this.userService.getUserNotifications(this.user).subscribe((data: any) => {
              if (data.length) {
                this.notificationsSent.notifications = data[0].notifications;
              }

              this.todaysCallsProgress =
                (parseInt(this.todaysCalls.completed) / parseInt(this.todaysCalls.scheduled)) * 100;
              this.weeklyCallsProgress =
                (parseInt(this.weeklyCalls.completed) / parseInt(this.weeklyCalls.scheduled)) * 100;
              this.callsMadeProgress = (parseInt(this.callsMade.callsMade) / parseInt(this.callsMade.totalCalls)) * 100;
              this.notificationsProgress =
                (parseInt(this.notificationsSent.notifications) / parseInt(this.notificationsSent.totalNotifications)) *
                100;
            });
          });
        });
      });
    });
  }
}
