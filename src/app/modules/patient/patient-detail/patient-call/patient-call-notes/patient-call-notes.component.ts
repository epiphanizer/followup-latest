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
  styleUrls: ['./patient-call-notes.component.scss']
})
export class PatientCallNotesComponent implements OnInit {
  @Input() patientCall: PatientCall;
  @Output() patientCallNotes: PatientCallNotes;
  patientCallNotesForm: FormGroup;
  patientCallNotes$: Observable<PatientCallNotes>;
  @Output() patientCallNotesChangeEmitter = new EventEmitter<PatientCallNotes>();
  highlighterActive: boolean;
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
      console.log('change in patientCallNotes');
      this.patientCallNotes.patientCallNotes = val;
      this.patientCallNotesChangeEmitter.emit(this.patientCallNotes);
    });
  }
  activateHighlighter() {
    if (this.highlighterActive == false) {
      this.highlighterActive = true;
    } else {
      this.highlighterActive = false;
    }
  }
  private createForm() {
    this.patientCallNotesForm = this.fb.group({
      patientCallNotes: this.fb.control('')
    });
  }
}
