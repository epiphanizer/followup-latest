import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '../patient-call.service';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-patient-call-history-controls',
  templateUrl: './patient-call-history-controls.component.html',
  styleUrls: ['./patient-call-history-controls.component.scss']
})
export class PatientCallHistoryControlsComponent implements OnInit {
  @Input() patient: Patient;
  clicked: number;
  patientCalls: PatientCall[];
  constructor() {}

  ngOnInit() {
    this.patient.patientCalls$.subscribe((data: PatientCall[]) => {
      this.patientCalls = data;
      return data;
    });
  }

  scrollToPatientCall(patientCall: number) {
    this.clicked = patientCall;
    // we may have to use @ViewChild here
    // @see https://stackoverflow.com/questions/43945548/scroll-to-element-on-click-in-angular-4
    // @see https://stackoverflow.com/questions/32977271/create-dynamic-anchorname-components-with-componentresolver-and-ngfor-in-angular
    alert('scrolling to patient call: ' + patientCall);
    // el.scrollIntoView({behavior:"smooth"});
  }
}
