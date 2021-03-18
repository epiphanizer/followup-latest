import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserMessage } from '@app/modules/user/user';
import { TeamMessage } from '@app/modules/team/team';
import { UserService } from '@app/modules/user/user.service';
import { TeamService } from '@app/modules/team/team.service';

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
    todaysCalls: 0,
    queueCalls: 0
  };
  weeklyCalls: any = {
    weeklyCalls: 0,
    queueCalls: 0
  };
  callsMade: any = {
    callsMade: 0,
    totalCalls: 0
  };
  notificationsSent: any = {
    notificationsSent: 0,
    totalNotificationsSent: 0
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
    this.userService.getUserMessages(this.user).subscribe((userMessages: UserMessage[]) => {
      console.log(userMessages);
      this.userMessage = userMessages[0];
    });
    /**
     * Data dashboard calls
     */
    this.userService.getUserCalls(this.user).subscribe((data: any) => {
      console.log(data);
    });
    this.userService.getUserNotifications(this.user).subscribe((data: any) => {
      console.log(data);
    });
  }
}
