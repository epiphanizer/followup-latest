import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PatientCall } from '../../patient-call/patient-call.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PatientCallNotesService } from '@app/modules/patient/patient-detail/patient-call/patient-call-notes/patient-call-notes.service';
import { PatientCallNotes } from './patient-call-notes.service';
import { Observable } from 'rxjs';

@Component({
  providers: [PatientCallNotesService],
  selector: 'app-patient-call-notes',
  templateUrl: './patient-call-notes.component.html',
  styleUrls: ['./patient-call-notes.component.scss'],
  standalone: false
})
export class PatientCallNotesComponent implements OnInit {
  @Input() patientCall: PatientCall;
  @Output() patientCallNotes: PatientCallNotes;
  patientCallNotesForm: FormGroup;
  patientCallNotes$: Observable<PatientCallNotes>;
  @Output() patientCallNotesChangeEmitter = new EventEmitter<PatientCallNotes>();
  @Output() patientCallNotesHighlightedChangeEmitter = new EventEmitter<number>();
  highlighterActive: boolean = false;
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    this.patientCallNotes = {
      patientCallNotes: ''
    };
    this.onChanges();
  }
  onChanges() {
    this.patientCallNotesForm.get('patientCallNotes').valueChanges.subscribe(val => {
      this.patientCallNotes.patientCallNotes = encodeURI(val);
      this.patientCallNotesChangeEmitter.emit(this.patientCallNotes);
    });
  }
  highlightPatientCallNotes() {
    if (this.highlighterActive == false) {
      this.highlighterActive = true;
      this.patientCallNotesHighlightedChangeEmitter.emit(1);
    } else {
      this.highlighterActive = false;
      this.patientCallNotesHighlightedChangeEmitter.emit(0);
    }
  }
  createForm() {
    this.patientCallNotesForm = this.fb.group({
      patientCallNotes: this.fb.control('')
    });
  }
}
