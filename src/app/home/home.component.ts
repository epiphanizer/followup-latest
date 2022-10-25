import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserMessage, UserRoles } from '@app/modules/user/user';
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
  countReady: boolean = false;
  notificationsProgress: number;
  weeklyCallsToNotificationsPercentage: number = null;
  totalCallsToNotificationsPercentage: number = null;
  weeklyNotifications: any[];

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
    weeklyNotifications: 0,
    totalNotifications: 0
  };
  public userLevels: typeof UserRoles = UserRoles;
  public teamMessage: TeamMessage;
  public userMessage: UserMessage;
  public user: User;
  public menu: {}[] = [{}];
  constructor(
    private route: ActivatedRoute,
    private sharedFunctions: SharedFunctions,
    private teamService: TeamService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.teamService.getTeamMessagesByTeamId(this.user.teams[0].teamId).subscribe((teamMessages: TeamMessage[]) => {
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
              if (data) {
                this.notificationsSent.weeklyNotifications = [];
                this.notificationsSent.notifications = data;
                this.notificationsSent.user = data.length;
                var today = new Date();
                var lastweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
                this.notificationsSent.notifications.forEach((notification: any) => {
                  if (Date.parse(notification.notificationCreatedTime) > Date.parse(lastweek.toString())) {
                    this.notificationsSent.weeklyNotifications.push(notification);
                  }
                });
                this.notificationsProgress =
                  (parseInt(this.notificationsSent.notifications) /
                    parseInt(this.notificationsSent.totalNotifications)) *
                  100;
                if (this.notificationsProgress > 100) {
                  this.notificationsProgress = 100;
                }

                this.weeklyCallsToNotificationsPercentage = Math.round(
                  (parseInt(this.weeklyCalls.completed) / this.notificationsSent.weeklyNotifications.length
                    ? parseInt(this.notificationsSent.weeklyNotifications.length)
                    : 0) * 100
                );
                if (this.weeklyCallsToNotificationsPercentage > 100) {
                  this.weeklyCallsToNotificationsPercentage = 100;
                }
                this.totalCallsToNotificationsPercentage = Math.round(
                  (this.notificationsSent.totalNotifications / this.callsMade.totalCalls) * 100
                );
                if (this.totalCallsToNotificationsPercentage > 100) {
                  this.totalCallsToNotificationsPercentage = 100;
                }
              }

              this.todaysCallsProgress =
                (parseInt(this.todaysCalls.completed) / parseInt(this.todaysCalls.scheduled)) * 100;
              this.weeklyCallsProgress =
                (parseInt(this.weeklyCalls.completed) / parseInt(this.weeklyCalls.scheduled)) * 100;
              if (this.todaysCallsProgress > 100) {
                this.todaysCallsProgress = 100;
              }
              this.callsMadeProgress = (parseInt(this.callsMade.callsMade) / parseInt(this.callsMade.totalCalls)) * 100;
              if (this.callsMadeProgress > 100) {
                this.callsMadeProgress = 100;
              }

              this.countReady = true;
            });
          });
        });
      });
    });
  }
}
