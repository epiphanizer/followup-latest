import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/modules/data/data.service';
import * as FileSaver from 'file-saver';
import { User } from '@app/modules/user/user';
import { CompanyNote } from '@app/modules/team/team';

@Component({
  providers: [DataService],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public companyNote: CompanyNote = {
    companyNoteId: 0,
    companyNoteFrom: 'Steph',
    companyNoteSubject: 'Hey Team!',
    companyNoteMessage: 'This is a test message!'
  };
  public user: User;
  public menu: {}[] = [{}];
  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {}

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
  }
  doAction(actionType: string, $event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    /**
     * Get an Excel with current Wizard Bridge definitions
     */
    if (actionType == 'getData') {
      this.getData();
    }
  }
  getData() {
    this.dataService.getData().subscribe((data: Blob) => {
      var blob = new Blob([data], { type: data.type });
      FileSaver.saveAs(blob, 'data.xlsx');
    });
  }
}
