import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-patient-next-call-scheduler',
  templateUrl: './patient-next-call-scheduler.component.html',
  styleUrls: ['./patient-next-call-scheduler.component.scss']
})
export class PatientNextCallSchedulerComponent implements OnInit {
  @Output() patientNextCallDateSelectedEventEmitter = new EventEmitter<string>();
  todaysDateDay: number | string;
  scheduledCallDate: string;
  selectedDate: string;
  selectedDay: number;
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
  }

  ngOnInit() {}

  /**
   * A function to make sure that the date selected is after todays date
   */
  compareDates(dateToCompare: Date) {
    if (dateToCompare < this.todaysDate) {
      return true;
    }
    return false;
  }
  handleDateFilterChangeEvent($event: any) {
    let date = $event;
    let dateToCompare = new Date(date);
    if (this.compareDates(dateToCompare)) {
      alert('Please select a future date!');
      return;
    }
    console.log(date);
    // this.selectedDay = selectedDay;
    this.scheduledCallDate = date;
    this.status.scheduled = true;
    this.patientNextCallDateSelectedEventEmitter.emit(this.scheduledCallDate);
  }
  selectNextCallShortcut(timeframe: string) {
    alert('selecting shortcut date :' + timeframe);
  }
}
