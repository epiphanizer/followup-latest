import { Component, OnInit, Input } from '@angular/core';
import { PatientCallService, PatientCall } from '../patient-call.service';

@Component({
  selector: 'app-patient-next-call-finish-button',
  templateUrl: './patient-next-call-finish-button.component.html',
  styleUrls: ['./patient-next-call-finish-button.component.scss']
})
export class PatientNextCallFinishButtonComponent implements OnInit {
  @Input() patientCall: PatientCall;
  // think on this
  @Input() patientCallStatusLabelId: number;

  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}

  finalizePatientCall(patientCall: PatientCall, patientCallStatusLabelId: number) {
    alert('finalizing patient call');
    this.patientCallService.finalizePatientCall(patientCall.patientCallId, patientCallStatusLabelId);
  }
}
