import { Component, OnInit, Input } from '@angular/core';
import {
  PatientCallStatusService,
  PatientCallStatus
} from '@app/modules/patient/patient-detail/patient-call/patient-call-status.service';
import { PatientCall } from '../patient-call.service';

@Component({
  selector: 'app-patient-call-status-controls',
  templateUrl: './patient-call-status-controls.component.html',
  styleUrls: ['./patient-call-status-controls.component.scss']
})
export class PatientCallStatusControlsComponent implements OnInit {
  @Input() patientCall: PatientCall;
  patientCallStatuses: PatientCallStatus[];
  constructor(private patientCallStatusService: PatientCallStatusService) {}

  ngOnInit() {
    this.patientCallStatusService.getPatientCallStatuses().subscribe((data: PatientCallStatus[]) => {
      this.patientCallStatuses = data;
    });
  }

  updatePatientCallStatus(patientCallId: number, patientCallStatusLabelId: number) {
    alert('updating patient call status: ' + patientCallStatusLabelId);
    this.patientCallStatusService.addPatientCallStatusByPatientCallId(patientCallId, patientCallStatusLabelId);
    // This needs to be an Emitter
  }
}
