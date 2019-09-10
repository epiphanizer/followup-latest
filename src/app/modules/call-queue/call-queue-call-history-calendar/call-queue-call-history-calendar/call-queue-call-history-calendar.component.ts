import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-call-queue-call-history-calendar',
  templateUrl: './call-queue-call-history-calendar.component.html',
  styleUrls: ['./call-queue-call-history-calendar.component.scss']
})
export class CallQueueCallHistoryCalendarComponent implements OnInit {
  months: {
    number: string;
    name: string;
  }[];
  todaysDate: Date;
  todaysMonth: string;
  currentMonth: {
    number: string;
    name: string;
  };

  constructor() {}

  ngOnInit() {
    this.todaysDate = new Date();
    this.todaysMonth = ('0' + (this.todaysDate.getMonth() + 1)).substring(0, 2);
    this.months = [
      {
        number: '01',
        name: 'January'
      },
      {
        number: '02',
        name: 'February'
      },
      {
        number: '03',
        name: 'March'
      },
      {
        number: '04',
        name: 'April'
      },
      {
        number: '05',
        name: 'May'
      },
      {
        number: '06',
        name: 'June'
      },
      {
        number: '07',
        name: 'July'
      },
      {
        number: '08',
        name: 'August'
      },
      {
        number: '09',
        name: 'September'
      },
      {
        number: '10',
        name: 'October'
      },
      {
        number: '11',
        name: 'November'
      },
      {
        number: '12',
        name: 'December'
      }
    ];
    // Subtract one because of the 0 index of the array
    this.currentMonth = this.months[parseInt(this.todaysMonth) - 1];
  }
}
