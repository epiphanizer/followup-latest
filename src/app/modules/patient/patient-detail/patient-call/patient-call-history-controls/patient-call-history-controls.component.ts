import { Component, OnInit } from '@angular/core';
import { PatientCall } from '../patient-call.service';

@Component({
  selector: 'app-patient-call-history-controls',
  templateUrl: './patient-call-history-controls.component.html',
  styleUrls: ['./patient-call-history-controls.component.scss']
})
export class PatientCallHistoryControlsComponent implements OnInit {
  patientCalls: PatientCall[];
  constructor() {}

  ngOnInit() {}
  scrollToPatientCall() {
    alert('scrolling to patient call');
  }
}
