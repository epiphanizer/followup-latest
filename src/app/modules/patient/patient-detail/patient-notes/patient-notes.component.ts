import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-patient-notes',
  templateUrl: './patient-notes.component.html',
  styleUrls: ['./patient-notes.component.scss']
})
export class PatientNotesComponent implements OnInit {
  @Input() patient: Patient;
  constructor() {}

  ngOnInit() {}
}
