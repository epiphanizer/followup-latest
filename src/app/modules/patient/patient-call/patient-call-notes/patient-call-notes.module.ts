import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PatientCallNoteHighlight,
  PatientCallNoteHighlightService
} from '@app/modules/patient/patient-call/patient-call-notes/patient-call-notes.module';
@NgModule({
  declarations: [],
  imports: [CommonModule]
})
export class PatientCallNotesModule {
  patientCallNoteHighlights: [PatientCallNoteHighlights];
}
