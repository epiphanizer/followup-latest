import { Component, OnInit, Input } from '@angular/core';
import { PatientCallService, PatientCall } from '../patient-call.service';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-patient-next-call-finish-button',
  templateUrl: './patient-next-call-finish-button.component.html',
  styleUrls: ['./patient-next-call-finish-button.component.scss']
})
export class PatientNextCallFinishButtonComponent implements OnInit {
  @Input() patient: Patient;
  @Input() patientCall: PatientCall;

  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}

  finalizePatientCall(patient: Patient, patientCall: PatientCall) {}
}
