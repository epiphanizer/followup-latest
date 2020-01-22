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
  @Output() patientFinalCallStatusChangeEmitter = new EventEmitter<boolean>();
  finalCallStatus: boolean;
  patientCallStatuses: PatientCallStatus[];
  constructor(private patientCallStatusService: PatientCallStatusService) {}

  ngOnInit() {
    this.finalCallStatus = false;
    this.patientCallStatusService.getPatientCallStatuses().subscribe((data: PatientCallStatus[]) => {
      this.patientCallStatuses = data;
    });
  }
  updateFinalCallStatus() {
    if (!this.finalCallStatus == true) {
      this.finalCallStatus = true;
      this.patientFinalCallStatusChangeEmitter.emit(true);
    } else {
      this.finalCallStatus = false;
      this.patientFinalCallStatusChangeEmitter.emit(false);
    }
  }
  updatePatientCallStatus(patientCallStatusLabelId: number) {
    this.patientCallStatusChangeEmitter.emit(patientCallStatusLabelId);
  }
}
