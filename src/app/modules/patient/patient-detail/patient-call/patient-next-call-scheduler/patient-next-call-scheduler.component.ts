import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-patient-next-call-scheduler',
  templateUrl: './patient-next-call-scheduler.component.html',
  styleUrls: ['./patient-next-call-scheduler.component.scss']
})
export class PatientNextCallSchedulerComponent implements OnInit {
  months: {
    number: string;
    name: string;
  }[];
  todaysDateDay: number | string;
  currentMonth: {
    number: string;
    name: string;
  };
  scheduledCallDate: string;
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
    this.todaysMonth = ('0' + (this.todaysDate.getMonth() + 1)).substring(0, 2);
    this.todaysYear = this.todaysDate.getFullYear();
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
    this.selectedMonth = this.currentMonth = this.months[parseInt(this.todaysMonth) - 1];
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
    this.selectedMonth = this.months[parseInt(this.currentMonth.number) - 2];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentMonth.number), this.todaysYear);
  }
  calendarNextMonth() {
    this.currentMonth = this.months[parseInt(this.currentMonth.number)];
    this.selectedMonth.numberOfDays = this.daysInMonth(parseInt(this.currentMonth.number), this.todaysYear);
  }
  selectDateEventHandler(selectedDay: number, currentMonth: number, todaysYear: number) {
    let date = currentMonth + '/' + selectedDay + '/' + todaysYear;
    this.selectedDay = selectedDay;
    this.scheduledCallDate = date;
    this.status.scheduled = true;
  }
}
