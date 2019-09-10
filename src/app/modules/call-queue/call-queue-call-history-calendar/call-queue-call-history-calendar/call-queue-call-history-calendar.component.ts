import { Component, OnInit } from '@angular/core';
import { MonthCalendarModule, DayOfWeek } from 'simple-angular-calendar';

@Component({
  selector: 'app-call-queue-call-history-calendar',
  templateUrl: './call-queue-call-history-calendar.component.html',
  styleUrls: ['./call-queue-call-history-calendar.component.scss']
})
export class CallQueueCallHistoryCalendarComponent implements OnInit {
  months: {}[];
  todaysDate: Date;
  todaysMonth: string;

  constructor() {
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
  }

  ngOnInit() {}
  private overRideDayCaption = ['', '', '', '', '', '', ''];

  dayOfWeekCaptionFormatter = (dayOfWeek: DayOfWeek) => {
    return this.overRideDayCaption[dayOfWeek.valueOf()];
  };
}
