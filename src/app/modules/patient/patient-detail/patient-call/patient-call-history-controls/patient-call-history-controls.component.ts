import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '../patient-call.service';

@Component({
  selector: 'app-patient-call-history-controls',
  templateUrl: './patient-call-history-controls.component.html',
  styleUrls: ['./patient-call-history-controls.component.scss']
})
export class PatientCallHistoryControlsComponent implements OnInit {
  @Input() patientCalls: PatientCall[];
  clicked: number;
  constructor() {}

  ngOnInit() {}

  scrollToPatientCall(patientCall: PatientCall) {
    this.clicked = patientCall.patientCallCount;
    let element = document.querySelector('#call-' + patientCall.patientCallCount);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
