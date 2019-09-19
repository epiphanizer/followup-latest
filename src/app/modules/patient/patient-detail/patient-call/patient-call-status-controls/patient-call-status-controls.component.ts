import { Component, OnInit } from '@angular/core';
import {
  PatientCallStatusService,
  PatientCallStatus
} from '@app/modules/patient/patient-detail/patient-call/patient-call-status.service';

@Component({
  selector: 'app-patient-call-status-controls',
  templateUrl: './patient-call-status-controls.component.html',
  styleUrls: ['./patient-call-status-controls.component.scss']
})
export class PatientCallStatusControlsComponent implements OnInit {
  patientCallStatuses: PatientCallStatus[];
  constructor(private patientCallStatusService: PatientCallStatusService) {}

  ngOnInit() {
    this.patientCallStatusService.getPatientCallStatuses().subscribe((data: PatientCallStatus[]) => {
      this.patientCallStatuses = data;
    });
  }

  updatePatientCallStatus(patientCallId: number, patientCallStatusLabelId: number) {
    alert('updating patient call status');
    this.patientCallStatusService.addPatientCallStatusByPatientCallId(patientCallId, patientCallStatusLabelId);
  }
}
