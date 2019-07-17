import { Component, OnInit } from '@angular/core';
import { MonthCalendarModule, DayOfWeek } from 'simple-angular-calendar';

@Component({
  selector: 'app-call-queue-call-history-calendar',
  templateUrl: './call-queue-call-history-calendar.component.html',
  styleUrls: ['./call-queue-call-history-calendar.component.scss']
})
export class CallQueueCallHistoryCalendarComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  private overRideDayCaption = ['', '', '', '', '', '', ''];

  dayOfWeekCaptionFormatter = (dayOfWeek: DayOfWeek) => {
    return this.overRideDayCaption[dayOfWeek.valueOf()];
  };
}
