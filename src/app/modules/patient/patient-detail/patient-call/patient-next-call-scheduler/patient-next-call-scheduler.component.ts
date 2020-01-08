import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-patient-next-call-scheduler',
  templateUrl: './patient-next-call-scheduler.component.html',
  styleUrls: ['./patient-next-call-scheduler.component.scss']
})
export class PatientNextCallSchedulerComponent implements OnInit {
  @Output() patientNextCallDateSelectedEventEmitter = new EventEmitter<string>();
  dayHeaders: Array<string> = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
  months: {
    number: string;
    name: string;
  }[];
  todaysDateDay: number | string;
  chosenMonth: string;
  chosenYear: number;
  currentCalendarMonth: {
    number: string;
    name: string;
  };
  scheduledCallDate: string;
  selectedDate: string;
  selectedDay: number;
  selectedMonth: {
    number: string;
    name: string;
    daysArray?: number[];
    numberOfDays?: number;
  };
  selectedYear: {
    year: number;
  } = {
    year: null
  };
  status: {
    scheduled: boolean;
  } = {
    scheduled: false
  };
  todaysDate: Date;
  todaysMonth: string;
  todaysYear: number;

  // We put this in the constructor rather than ngOnInit()
  // simply because it helps readability in this particular case.
  constructor() {
    this.todaysDate = new Date();
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    this.todaysMonth = (this.todaysDate.getMonth() + 1).toString();
    this.todaysYear = this.todaysDate.getFullYear();
    this.months = [
      {
        number: '1',
        name: 'January'
      },
      {
        number: '2',
        name: 'February'
      },
      {
        number: '3',
        name: 'March'
      },
      {
        number: '4',
        name: 'April'
      },
      {
        number: '5',
        name: 'May'
      },
      {
        number: '6',
        name: 'June'
      },
      {
        number: '7',
        name: 'July'
      },
      {
        number: '8',
        name: 'August'
      },
      {
        number: '9',
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

    this.selectedMonth = this.currentCalendarMonth = this.months[parseInt(this.todaysMonth) - 1];
    this.chosenMonth = this.months[parseInt(this.todaysMonth) - 1].number;
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.todaysMonth), this.todaysYear);
    this.selectedMonth.daysArray = Array.from(Array(this.selectedMonth.numberOfDays).keys()).map(x => ++x);
    this.chosenYear = this.selectedYear.year = this.todaysYear;
    this.createDaysArray();
  }

  ngOnInit() {}

  createDaysArray() {
    let firstDayOfMonthIndex = this.getFirstDayOfMonthIndex(
      this.selectedYear.year,
      parseInt(this.selectedMonth.number)
    );

    this.selectedMonth.daysArray = Array.from(Array(this.selectedMonth.numberOfDays).keys()).map(x => ++x);
    let offsetNumber = this.getFirstDayOffset(firstDayOfMonthIndex);
    /**
     * Add negative values to the start of the daysArray loop (unshift)
     * We hide the actual value from the frontend in terms of <span>{{day}}</span>
     * but we use use the values to provide the placeholder we need.
     */
    for (var j = offsetNumber; j < 0; j++) {
      this.selectedMonth.daysArray.unshift(j);
    }
  }
  /**
   * A function to get which day Sun = 0 -> Sat = 6
   * the first of the month & year falls in.
   * We use this function to calculate an offset
   * so that our calendar days fall on real values.
   */
  getFirstDayOfMonthIndex(year: number, month: number) {
    /**
     * always the first day of the month,
     * subtract one from the month number to get the js
     * proper month
     */
    var dt = new Date(year, month - 1, 1, 0, 0, 0, 0);
    var dayOfWeekIndex = dt.getDay();
    return dayOfWeekIndex;
  }
  /**
   * A function to get the offset value of the first
   * day of the month. We'll pipe these numbers ranged (-6 -> 0)
   * into the daysArray and that will allow us to start the calendar
   * on the appropriate day header
   */
  getFirstDayOffset(firstDayOfMonthIndex: number) {
    return 0 - firstDayOfMonthIndex;
  }

  daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }
  calendarPrevMonth() {
    this.selectedMonth.number = (parseInt(this.selectedMonth.number) - 1).toString();
    if (this.selectedMonth.number !== '0') {
      this.currentCalendarMonth = this.months[parseInt(this.selectedMonth.number) - 1];
      this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentCalendarMonth.number), this.todaysYear);
    } else {
      this.currentCalendarMonth = this.months[11];
      this.selectedMonth.number = '12';
      this.selectedYear.year = this.selectedYear.year - 1;
      this.selectedMonth.numberOfDays = this.daysInMonth(
        parseInt(this.currentCalendarMonth.number),
        this.selectedYear.year
      );
    }
    this.createDaysArray();
  }
  calendarNextMonth() {
    this.selectedMonth.number = (parseInt(this.selectedMonth.number) + 1).toString();
    this.currentCalendarMonth = this.months[parseInt(this.selectedMonth.number) - 1];

    console.log(this.currentCalendarMonth);
    console.log(this.selectedMonth.number);
    if (this.selectedMonth.number !== '13') {
      this.currentCalendarMonth = this.months[parseInt(this.selectedMonth.number) - 1];
      this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentCalendarMonth.number), this.todaysYear);
    } else {
      this.currentCalendarMonth = this.months[0];
      this.selectedMonth.number = '1';
      this.selectedYear.year = this.selectedYear.year + 1;
      this.selectedMonth.numberOfDays = this.daysInMonth(
        parseInt(this.currentCalendarMonth.number),
        this.selectedYear.year
      );
    }
    this.createDaysArray();
  }
  selectDateEventHandler(selectedDay: number, currentCalendarMonth: number, todaysYear: number) {
    let date = currentCalendarMonth + '/' + selectedDay + '/' + this.selectedYear.year;
    this.selectedDay = selectedDay;
    this.scheduledCallDate = date;
    this.status.scheduled = true;
    this.patientNextCallDateSelectedEventEmitter.emit(this.scheduledCallDate);
  }
}
