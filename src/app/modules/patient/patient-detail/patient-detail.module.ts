import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PatientDetailComponent } from './patient-detail.component';
import { PatientCallControlsComponent } from './patient-call-controls/patient-call-controls.component';
import { PatientCallNotesComponent } from './patient-call-notes/patient-call-notes.component';
import { PatientCallQuestionsComponent } from './patient-call-questions/patient-call-questions.component';
import { PatientSummaryWidgetComponent } from './patient-summary-widget/patient-summary-widget.component';
import { PatientCallHistoryControlsComponent } from './patient-call-history-controls/patient-call-history-controls.component';
import { PatientCallHistoryListingComponent } from './patient-call-history-listing/patient-call-history-listing.component';

@NgModule({
  declarations: [
    PatientDetailComponent,
    PatientCallControlsComponent,
    PatientCallNotesComponent,
    PatientCallQuestionsComponent,
    PatientSummaryWidgetComponent,
    PatientCallHistoryControlsComponent,
    PatientCallHistoryListingComponent
  ],
  imports: [CommonModule, RouterModule, IonicModule]
})
export class PatientDetailModule {}
