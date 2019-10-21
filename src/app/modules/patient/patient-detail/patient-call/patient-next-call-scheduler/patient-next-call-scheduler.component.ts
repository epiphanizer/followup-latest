import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-patient-next-call-scheduler',
  templateUrl: './patient-next-call-scheduler.component.html',
  styleUrls: ['./patient-next-call-scheduler.component.scss']
})
export class PatientNextCallSchedulerComponent implements OnInit {
  @Output() patientNextCallDateSelectedEventEmitter = new EventEmitter<string>();
  months: {
    number: string;
    name: string;
  }[];
  todaysDateDay: number | string;
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
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.todaysMonth), this.todaysYear);
    this.selectedMonth.daysArray = Array.from(Array(this.selectedMonth.numberOfDays).keys()).map(x => ++x);
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {}

  daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }
  calendarPrevMonth() {
    this.selectedMonth = this.months[parseInt(this.currentCalendarMonth.number) - 2];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentCalendarMonth.number), this.todaysYear);
  }
  calendarNextMonth() {
    this.currentCalendarMonth = this.months[parseInt(this.currentCalendarMonth.number)];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentCalendarMonth.number), this.todaysYear);
  }
  selectDateEventHandler(selectedDay: number, currentCalendarMonth: number, todaysYear: number) {
    let date = currentCalendarMonth + '/' + selectedDay + '/' + todaysYear;
    this.selectedDay = selectedDay;
    this.scheduledCallDate = date;
    this.status.scheduled = true;
    this.patientNextCallDateSelectedEventEmitter.emit(this.scheduledCallDate);
  }
}
