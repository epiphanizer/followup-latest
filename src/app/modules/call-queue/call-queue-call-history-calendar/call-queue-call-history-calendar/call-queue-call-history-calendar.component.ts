import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import { Observable, from, of } from 'rxjs';
import { PatientCall } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { Operation } from '@app/modules/operation/operation';

@Component({
  selector: 'app-call-queue-call-history-calendar',
  templateUrl: './call-queue-call-history-calendar.component.html',
  styleUrls: ['./call-queue-call-history-calendar.component.scss']
})
export class CallQueueCallHistoryCalendarComponent implements OnInit {
  @Input() operation: Operation;
  @Output() dateFilterChangeEvent = new EventEmitter<string>();
  months: {
    number: string;
    name: string;
  }[];
  todaysDateDay: number | string;
  currentCalendarMonth: {
    number: string;
    name: string;
  };
  patientCallsFiltered: Array<any>;
  selectedDay: number;
  selectedDate: Date | string;
  selectedMonth: {
    number: string;
    name: string;
    daysArray?: number[];
    numberOfDays?: number;
  };
  selectedYear: {
    year: number;
  };
  todaysDate: Date;
  todaysMonth: string;
  todaysYear: number;

  patientCalls$: Observable<PatientCall[]>;
  constructor() {}

  ngOnInit() {
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
    // Subtract one because of the 0 index of the array
    this.selectedDay = this.todaysDateDay;

    this.selectedMonth = this.currentCalendarMonth = this.months[parseInt(this.todaysMonth) - 1];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.todaysMonth), this.todaysYear);
    this.selectedMonth.daysArray = Array.from(Array(this.selectedMonth.numberOfDays).keys()).map(x => ++x);
    let formattedDay = this.selectedDay.toString();
    if (formattedDay.length == 1) {
      formattedDay = '0' + formattedDay;
    }
    this.selectedDate = this.selectedMonth.number + '/' + formattedDay + '/' + this.todaysYear;
  }

  daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }
  calendarPrevMonth() {
    this.currentCalendarMonth = this.months[parseInt(this.selectedMonth.number) - 2];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentCalendarMonth.number), this.todaysYear);
  }
  calendarNextMonth() {
    this.currentCalendarMonth = this.months[parseInt(this.selectedMonth.number) - 1];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentCalendarMonth.number), this.todaysYear);
  }
  selectDateEventHandler(day: number, currentCalendarMonth: number, todaysYear: number) {
    let formattedDay = day.toString();
    if (formattedDay.length == 1) {
      formattedDay = '0' + formattedDay;
    }
    this.selectedDate = currentCalendarMonth + '/' + formattedDay + '/' + todaysYear;
    this.selectedDay = day;
    this.dateFilterChangeEvent.emit(this.selectedDate);
  }
}
