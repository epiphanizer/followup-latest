import { Component, OnInit } from '@angular/core';
import { Patient } from '@app/modules/patient/patient.service';
import { PatientCall } from '../patient-call/patient-call.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient;
  call: PatientCall;
  constructor() {}

  ngOnInit() {}
}
