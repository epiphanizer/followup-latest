import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PatientCall } from '../patient-call.service';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-patient-next-call-finish-button',
  templateUrl: './patient-next-call-finish-button.component.html',
  styleUrls: ['./patient-next-call-finish-button.component.scss'],
  standalone: false
})
export class PatientNextCallFinishButtonComponent implements OnInit {
  @Input() patient: Patient;
  @Input() patientCall: PatientCall;
  @Input() disabled: boolean = false;
  @Output() patientCallFinalizeEventEmitter = new EventEmitter<PatientCall>();

  ngOnInit() {}

  finalizePatientCall(patientCall: PatientCall) {
    if (this.disabled) {
      return;
    }

    this.patientCallFinalizeEventEmitter.emit(patientCall);
  }
}
