import { Component, OnInit } from '@angular/core';

export interface Patient {
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientAvatarImage: string;
}

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
