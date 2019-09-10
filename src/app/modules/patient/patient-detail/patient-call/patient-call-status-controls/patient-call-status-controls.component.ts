import { Component, OnInit } from '@angular/core';
import { PatientCallStatusService } from '@app/modules/patient/patient-detail/patient-call/patient-call-status.service';

@Component({
  selector: 'app-patient-call-status-controls',
  templateUrl: './patient-call-status-controls.component.html',
  styleUrls: ['./patient-call-status-controls.component.scss']
})
export class PatientCallStatusControlsComponent implements OnInit {
  constructor(private patientCallStatusService: PatientCallStatusService) {}

  ngOnInit() {}

  updatePatientCallStatus() {
    alert('updating patient call status');
    // this.patientCallStatusService.addPatientCallStatusByPatientCallId();
  }
}
