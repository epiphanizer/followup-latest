import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PatientCall } from '../patient-call.service';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-patient-next-call-finish-button',
  templateUrl: './patient-next-call-finish-button.component.html',
  styleUrls: ['./patient-next-call-finish-button.component.scss']
})
export class PatientNextCallFinishButtonComponent implements OnInit {
  @Input() patient: Patient;
  @Input() patientCall: PatientCall;
  @Output() patientCallFinalizeEventEmitter = new EventEmitter<PatientCall>();

  ngOnInit() {}

  finalizePatientCall(patientCall: PatientCall) {
    this.patientCallFinalizeEventEmitter.emit(patientCall);
  }
}
