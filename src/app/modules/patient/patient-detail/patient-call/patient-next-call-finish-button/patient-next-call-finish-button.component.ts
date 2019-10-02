import { Component, OnInit, Input } from '@angular/core';
import { PatientCallService, PatientCall } from '../patient-call.service';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-patient-next-call-finish-button',
  templateUrl: './patient-next-call-finish-button.component.html',
  styleUrls: ['./patient-next-call-finish-button.component.scss']
})
export class PatientNextCallFinishButtonComponent implements OnInit {
  @Input() patientCall: PatientCall;
  @Input() patientCallStatusLabelId: number;

  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}

  finalizePatientCall(patient: Patient, patientCall: PatientCall) {
    this.patientCallService
      .scheduleNewPatientCallByPatientId(patient.patientId, this.patientCall.patientCallStatusLabelId)
      .subscribe((data: any) => {
        console.log(data);
        debugger;
      });
    this.patientCallService
      .finalizePatientCall(patientCall.patientCallId, this.patientCall.patientCallStatusLabelId)
      .subscribe((data: any) => {
        console.log(data);
        debugger;
      });
  }
}
