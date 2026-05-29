import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
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
  styleUrls: ['./home.component.scss'],
  standalone: false
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
    this.loadTeamTotalsAndUserData(user);

    const teamId = user.teams?.[0]?.teamId;
    if (teamId) {
      this.teamService.getTeamMessagesByTeamId(teamId).subscribe((teamMessages: TeamMessage[]) => {
        if (teamMessages?.length) {
          this.teamMessage = teamMessages[0];
          // Decode our message to preserve line breaks, other symbols.
          this.teamMessage.messageBody = this.sharedFunctions.returnHTML(this.teamMessage.messageBody);
        }
      });
    } else {
      this.teamMessage = null;
    }
  }

  private loadTeamTotalsAndUserData(user: User) {
    forkJoin({
      userMessages: this.userService.getUserMessages(user).pipe(catchError(() => of([]))),
      userCounts: this.userService.getUserCallCount(user).pipe(catchError(() => of([]))),
      userNotifications: this.userService.getUserNotifications(user).pipe(catchError(() => of([])))
    }).subscribe(({ userMessages, userCounts, userNotifications }) => {
      const userCountsRecord = this.firstRecord(userCounts);
      const notifications = Array.isArray(userNotifications) ? userNotifications : [];

      if (Array.isArray(userMessages) && userMessages.length) {
        this.userMessage = userMessages[0];
        this.userMessage.messageBody = this.sharedFunctions.returnHTML(this.userMessage.messageBody);
      }

      this.callsMade.totalCalls = this.getRecordNumber(userCountsRecord, ['totalCalls']);
      this.notificationsSent.totalNotifications = notifications.length;

      this.todaysCalls.completed = this.getRecordNumber(userCountsRecord, ['todaysCompletedCalls']);
      this.todaysCalls.scheduled = this.getRecordNumber(userCountsRecord, ['todaysScheduledCalls']);
      this.weeklyCalls.scheduled = this.getRecordNumber(userCountsRecord, ['weeklyScheduledCalls']);

      const totalCallsFromCount = this.getRecordNumber(userCountsRecord, ['totalCalls']);
      this.callsMade.callsMade = totalCallsFromCount;
      this.weeklyCalls.completed = this.deriveWeeklyCompletedCalls(
        this.getRecordNumber(userCountsRecord, ['weeklyCompletedCalls']),
        this.weeklyCalls.scheduled,
        totalCallsFromCount
      );

      this.notificationsSent.weeklyNotifications = [];
      this.notificationsSent.notifications = notifications;
      this.notificationsSent.user = notifications.length;

      const weeklyThreshold = this.getWeeklyThresholdTimestamp();
      this.notificationsSent.weeklyNotifications = notifications.filter(
        (notification: any) => Date.parse(notification.notificationCreatedTime) > weeklyThreshold
      );

      this.updateProgressMetrics();

      this.countReady = true;
    });

    // Team totals are used as a richer fallback for "all-calls" denominators.
    // We request them independently so home metrics can render quickly even when this endpoint is slow.
    this.teamService
      .getTeamTotals()
      .pipe(catchError(() => of([])))
      .subscribe((teamTotals: any[]) => {
        const teamTotalsRecord = this.firstRecord(teamTotals);
        this.callsMade.totalCalls = this.coalescePositive(
          this.getRecordNumber(teamTotalsRecord, ['totalCalls']),
          this.callsMade.totalCalls
        );
        this.notificationsSent.totalNotifications = this.coalescePositive(
          this.getRecordNumber(teamTotalsRecord, ['totalNotifications']),
          this.notificationsSent.totalNotifications
        );
        this.updateProgressMetrics();
      });
  }

  private updateProgressMetrics() {
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

    this.todaysCallsProgress = this.toPercentage(this.todaysCalls.completed, this.todaysCalls.scheduled);
    this.weeklyCallsProgress = this.toPercentage(this.weeklyCalls.completed, this.weeklyCalls.scheduled);
    this.callsMadeProgress = this.toPercentage(this.callsMade.callsMade, this.callsMade.totalCalls);
  }

  private getWeeklyThresholdTimestamp(): number {
    const today = new Date();
    const lastweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastweek.getTime();
  }

  private firstRecord(data: any): any {
    if (Array.isArray(data)) {
      return data[0] || {};
    }
    if (data && typeof data === 'object') {
      return data;
    }
    return {};
  }

  private getRecordNumber(record: any, keys: string[]): number {
    for (const key of keys) {
      const value = this.getRecordValue(record, key);
      if (value !== undefined && value !== null && value !== '') {
        return this.toNumber(value);
      }
    }
    return 0;
  }

  private getRecordValue(record: any, key: string): any {
    if (!record || typeof record !== 'object') {
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
    const matchedKey = Object.keys(record).find(existingKey => existingKey.toLowerCase() === key.toLowerCase());
    return matchedKey ? record[matchedKey] : undefined;
  }

  private coalescePositive(primary: number, fallback: number): number {
    return primary > 0 ? primary : fallback;
  }

  private deriveWeeklyCompletedCalls(
    weeklyCompletedCalls: number,
    weeklyScheduledCalls: number,
    totalCalls: number
  ): number {
    if (weeklyCompletedCalls > 0) {
      return weeklyCompletedCalls;
    }

    if (weeklyScheduledCalls > 0 && totalCalls > 0) {
      return Math.min(totalCalls, weeklyScheduledCalls);
    }

    return weeklyCompletedCalls;
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
    if (typeof value === 'string') {
      const normalizedString = value.replace(/,/g, '').trim();
      const normalizedValue = Number(normalizedString);
      return Number.isFinite(normalizedValue) ? normalizedValue : 0;
    }
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
