import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '@app/core/authentication/auth.service';
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
export class HomeComponent implements OnInit, OnDestroy {
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
  private destroy$ = new Subject<void>();
  constructor(
    private route: ActivatedRoute,
    private sharedFunctions: SharedFunctions,
    private teamService: TeamService,
    private userService: UserService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    const initialUser = this.authService.currentUserValue || this.route.snapshot.data.user;
    if (initialUser) {
      this.user = initialUser;
      this.loadDashboardForUser(initialUser);
    }

    this.authService.currentUser
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe(user => {
        if (!this.user || this.user.userId !== user.userId) {
          this.user = user;
          this.loadDashboardForUser(user);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardForUser(user: User) {
    if (!user) {
      return;
    }

    this.resetDashboardState();
    const teamId = user.teams?.[0]?.teamId;
    if (teamId) {
      this.teamService.getTeamMessagesByTeamId(teamId).subscribe((teamMessages: TeamMessage[]) => {
        if (teamMessages?.length) {
          this.teamMessage = teamMessages[0];
          // Decode our message to preserve line breaks, other symbols.
          this.teamMessage.messageBody = this.sharedFunctions.returnHTML(this.teamMessage.messageBody);
        }
        this.loadTeamTotalsAndUserData(user);
      });
    } else {
      this.teamMessage = null;
      this.loadTeamTotalsAndUserData(user);
    }
  }

  private loadTeamTotalsAndUserData(user: User) {
    this.teamService.getTeamTotals().subscribe((data: any) => {
      if (data.length) {
        this.callsMade.totalCalls = data[0].totalCalls;
        this.notificationsSent.totalNotifications = data[0].totalNotifications;
      }
      this.userService.getUserMessages(user).subscribe((userMessages: UserMessage[]) => {
        if (userMessages?.length) {
          this.userMessage = userMessages[0];
          this.userMessage.messageBody = this.sharedFunctions.returnHTML(this.userMessage.messageBody);
        }

        /**
         * Data dashboard calls
         */
        this.userService.getUserCallCount(user).subscribe((data: any) => {
          if (data.length) {
            this.todaysCalls.completed = data[0].todaysCompletedCalls;
            this.todaysCalls.scheduled = data[0].todaysScheduledCalls;
            this.weeklyCalls.completed = data[0].weeklyCompletedCalls;
            this.weeklyCalls.scheduled = data[0].weeklyScheduledCalls;
            this.callsMade.callsMade = data[0].totalCalls;
          }
          this.userService.getUserNotifications(user).subscribe((data: any) => {
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

              this.notificationsProgress = this.toPercentage(
                this.notificationsSent.user,
                this.notificationsSent.totalNotifications
              );
              this.weeklyCallsToNotificationsPercentage = this.toPercentage(
                this.notificationsSent.weeklyNotifications.length,
                this.weeklyCalls.completed
              );
              this.totalCallsToNotificationsPercentage = this.toPercentage(
                this.notificationsSent.totalNotifications,
                this.callsMade.totalCalls
              );
            }

            this.todaysCallsProgress = this.toPercentage(this.todaysCalls.completed, this.todaysCalls.scheduled);
            this.weeklyCallsProgress = this.toPercentage(this.weeklyCalls.completed, this.weeklyCalls.scheduled);
            this.callsMadeProgress = this.toPercentage(this.callsMade.callsMade, this.callsMade.totalCalls);

            this.countReady = true;
          });
        });
      });
    });
  }

  private toPercentage(numerator: any, denominator: any): number {
    const normalizedNumerator = this.toNumber(numerator);
    const normalizedDenominator = this.toNumber(denominator);
    if (normalizedNumerator <= 0 || normalizedDenominator <= 0) {
      return 0;
    }
    return Math.min(Math.round((normalizedNumerator / normalizedDenominator) * 100), 100);
  }

  private toNumber(value: any): number {
    const normalizedValue = Number(value);
    return Number.isFinite(normalizedValue) ? normalizedValue : 0;
  }

  private resetDashboardState() {
    this.countReady = false;
    this.teamMessage = null;
    this.userMessage = null;
    this.notificationsProgress = 0;
    this.todaysCallsProgress = 0;
    this.weeklyCallsProgress = 0;
    this.callsMadeProgress = 0;
    this.weeklyCallsToNotificationsPercentage = null;
    this.totalCallsToNotificationsPercentage = null;
    this.todaysCalls = {
      completed: 0,
      scheduled: 0
    };
    this.weeklyCalls = {
      completed: 0,
      scheduled: 0
    };
    this.callsMade = {
      callsMade: 0,
      totalCalls: 0
    };
    this.notificationsSent = {
      notifications: 0,
      weeklyNotifications: [],
      totalNotifications: 0,
      user: 0
    };
  }
}
