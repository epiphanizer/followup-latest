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

  // /**
  //  * CSS class for the month.
  //  */
  // monthClass = 'custom-month';

  // /**
  //  * CSS class for the month caption.
  //  */
  // monthCaptionClass = 'custom-month__caption';

  // /**
  //  * CSS class for the day of the week captions.
  //  */
  // dayOfWeekCaptionClass = 'custom-month__week-caption';

  // /**
  //  * CSS class for the day captions.
  //  */
  // dayCaptionClass = 'custom-month__day';

  // /**
  //  * CSS class for day.
  //  */
  // defaultDayClass = 'custom-month__day--default';

  // /**
  //  * CSS class for the current day.
  //  */
  // currentDayClass = 'custom-month__day--today';

  // /**
  //  * CSS class for the selected day.
  //  */
  // selectedDayClass = 'custom-month__day--selected';

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
