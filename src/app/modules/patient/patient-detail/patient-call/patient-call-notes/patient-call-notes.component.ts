import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '../../patient-call/patient-call.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PatientCallNotesService } from '@app/modules/patient/patient-detail/patient-call/patient-call-notes/patient-call-notes.service';
import { PatientCallNotes } from './patient-call-notes.service';
import { Observable } from 'rxjs';

@Component({
  providers: [PatientCallNotesService],
  selector: 'app-patient-call-notes',
  templateUrl: './patient-call-notes.component.html',
  styleUrls: ['./patient-call-notes.component.scss']
})
export class PatientCallNotesComponent implements OnInit {
  @Input() patientCall: PatientCall;
  patientCallNotesForm: FormGroup;
  patientCallNotes: PatientCallNotes | null = null;
  patientCallNotes$: Observable<PatientCallNotes>;
  constructor(fb: FormBuilder, patientCallNotesService: PatientCallNotesService) {}

  ngOnInit() {
    this.createForm();
  }
  private createForm() {}
}
