import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-patient-call-stop-button',
  templateUrl: './patient-call-stop-button.component.html',
  styleUrls: ['./patient-call-stop-button.component.scss']
})
export class PatientCallStopButtonComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  stopPatientCall() {
    alert('Stopping Patient Call');
  }
}
