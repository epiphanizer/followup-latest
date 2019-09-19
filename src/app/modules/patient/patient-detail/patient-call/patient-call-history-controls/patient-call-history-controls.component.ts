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
  patientCalls: PatientCall[];
  constructor() {}

  ngOnInit() {
    this.patient.patientCalls$.subscribe((data: PatientCall[]) => {
      this.patientCalls = data;
      return data;
    });
  }

  scrollToPatientCall() {
    alert('scrolling to patient call');
  }
}
