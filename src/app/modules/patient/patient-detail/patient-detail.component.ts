import { Component, OnInit } from '@angular/core';
import { Patient } from '@app/modules/patient/patient.component';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient;
  constructor() {}

  ngOnInit() {}
}
