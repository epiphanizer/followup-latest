import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserMessage } from '@app/modules/user/user';
import { TeamMessage } from '@app/modules/team/team';

@Component({
  providers: [],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public teamMessage: any = {
    messageId: 0,
    teamMessageFrom: 'Steph',
    teamMessageSubject: 'Hey Team!',
    teamMessageContent: 'This is a test message!'
  };
  userMessagesPage: UserMessage;
  public user: User;
  public menu: {}[] = [{}];
  constructor(private route: ActivatedRoute, private router: Router) {}

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
  }
}
