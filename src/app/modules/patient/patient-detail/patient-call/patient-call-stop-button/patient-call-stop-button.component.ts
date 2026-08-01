import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PatientCallService, PatientCall } from '../patient-call.service';

@Component({
  selector: 'app-patient-call-stop-button',
  templateUrl: './patient-call-stop-button.component.html',
  styleUrls: ['./patient-call-stop-button.component.scss'],
  standalone: false
})
export class PatientCallStopButtonComponent implements OnInit {
  @Input() patientCall: PatientCall;
  @Input() disabled: boolean = false;
  @Output() patientCallEndEventEmitter = new EventEmitter<PatientCall>();
  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}
  stopPatientCall() {
    if (this.disabled) {
      return;
    }

    this.patientCallService.endPatientCall(this.patientCall.patientCallId).subscribe((patientCall: PatientCall) => {
      this.patientCallEndEventEmitter.emit(patientCall);
    });
  }
}
