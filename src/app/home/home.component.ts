import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserMessage } from '@app/modules/user/user';
import { TeamMessage } from '@app/modules/team/team';
import { UserService } from '@app/modules/user/user.service';
import { TeamService } from '@app/modules/team/team.service';
import { PatientCall } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';

@Component({
  providers: [UserService],
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
  userMessage: UserMessage;
  public user: User;
  public menu: {}[] = [{}];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    console.log(this.user);
    // this.teamService.getTeamMessages().subscribe((teamMessages: TeamMessage[]) => {
    //   console.log(teamMessages);
    //   this.teamMessage = teamMessages[0];
    // });
    this.teamService.getTeamTotals().subscribe((data: any) => {
      console.log(data);
      this.callsMade.totalCalls = data[0].totalCalls;
      this.notificationsSent.totalNotifications = data[0].totalNotifications;
    });
    this.userService.getUserMessages(this.user).subscribe((userMessages: UserMessage[]) => {
      this.userMessage = userMessages[0];
    });
    /**
     * Data dashboard calls
     */
    this.userService.getUserCallCount(this.user).subscribe((data: any) => {
      console.log(data);
      this.todaysCalls.completed = data[0].todaysCompletedCalls;
      this.todaysCalls.scheduled = data[0].todaysScheduledCalls;
      this.weeklyCalls.completed = data[0].weeklyCompletedCalls;
      this.weeklyCalls.scheduled = data[0].weeklyScheduledCalls;
      this.callsMade.callsMade = data[0].totalCalls;
    });

    this.userService.getUserNotifications(this.user).subscribe((data: any) => {
      console.log(data);
      this.notificationsSent.notifications = data[0].notifications;
    });
  }
}
