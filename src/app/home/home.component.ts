import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserMessage } from '@app/modules/user/user';
import { TeamMessage } from '@app/modules/team/team';
import { UserService } from '@app/modules/user/user.service';

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

  public teamMessage: any = {
    messageId: 0,
    teamMessageFrom: 'Steph',
    teamMessageContent:
      'Good Morning Team! Don’t forget this Friday is…Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci.'
  };
  userMessagesPage: UserMessage;
  public user: User;
  public menu: {}[] = [{}];
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.user.userMessages = [
      {
        messageId: 0,
        messageSenderUserId: 0,
        messageSentDate: new Date(),
        messageSenderFirstName: 'Steph',
        messageBody: 'This reminded me of you 0!',
        messageAcknowledged: 0,
        messageAcknowledgedDate: null
      },
      {
        messageId: 1,
        messageSenderUserId: 0,
        messageSentDate: new Date(),
        messageSenderFirstName: 'Steph',
        messageBody: 'This reminded me of you 1!',
        messageAcknowledged: 0,
        messageAcknowledgedDate: null
      },
      {
        messageId: 2,
        messageSenderUserId: 0,
        messageSentDate: new Date(),
        messageSenderFirstName: 'Steph',
        messageBody: 'This reminded me of you 2!',
        messageAcknowledged: 0,
        messageAcknowledgedDate: null
      }
    ];
    this.userMessagesPage = this.user.userMessages[0];
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
