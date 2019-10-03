import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
  @Output() patientCallStatusChangeEmitter = new EventEmitter<number>();
  patientCallStatuses: PatientCallStatus[];
  constructor(private patientCallStatusService: PatientCallStatusService) {}

  ngOnInit() {
    this.patientCallStatusService.getPatientCallStatuses().subscribe((data: PatientCallStatus[]) => {
      this.patientCallStatuses = data;
    });
  }

  updatePatientCallStatus(patientCallStatusLabelId: number) {
    this.patientCallStatusChangeEmitter.emit(patientCallStatusLabelId);
  }
}
