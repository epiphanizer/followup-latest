import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '../../patient-call/patient-call.service';

@Component({
  selector: 'app-patient-call-notes',
  templateUrl: './patient-call-notes.component.html',
  styleUrls: ['./patient-call-notes.component.scss']
})
export class PatientCallNotesComponent implements OnInit {
  @Input() patientCall: PatientCall;
  constructor() {}

  ngOnInit() {}
}
