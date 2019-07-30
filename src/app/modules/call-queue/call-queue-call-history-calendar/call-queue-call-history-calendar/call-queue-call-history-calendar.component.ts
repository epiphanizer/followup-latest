import { Component, OnInit } from '@angular/core';
import { MonthCalendarModule, DayOfWeek } from 'simple-angular-calendar';

@Component({
  selector: 'app-call-queue-call-history-calendar',
  templateUrl: './call-queue-call-history-calendar.component.html',
  styleUrls: ['./call-queue-call-history-calendar.component.scss']
})
export class CallQueueCallHistoryCalendarComponent implements OnInit {
  /**
   * CSS class for the month.
   */
  monthClass = 'custom-month';

  /**
   * CSS class for the month caption.
   */
  monthCaptionClass = 'custom-month__caption';

  /**
   * CSS class for the day of the week captions.
   */
  dayOfWeekCaptionClass = 'custom-month__week-caption';

  /**
   * CSS class for the day captions.
   */
  dayCaptionClass = 'custom-month__day';

  /**
   * CSS class for day.
   */
  defaultDayClass = 'custom-month__day--default';

  /**
   * CSS class for the current day.
   */
  currentDayClass = 'custom-month__day--today';

  /**
   * CSS class for the selected day.
   */
  selectedDayClass = 'custom-month__day--selected';

  constructor() {}

  ngOnInit() {}
  private overRideDayCaption = ['', '', '', '', '', '', ''];

  dayOfWeekCaptionFormatter = (dayOfWeek: DayOfWeek) => {
    return this.overRideDayCaption[dayOfWeek.valueOf()];
  };
}
