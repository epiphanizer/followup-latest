import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PatientCallNoteHighlights,
  PatientCallNotesHighlightService
} from '@app/modules/patient/patient-call/patient-call-notes/patient-call-notes-highlight.service';
@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [PatientCallNotesHighlightService]
})
export class PatientCallNotesModule {}
