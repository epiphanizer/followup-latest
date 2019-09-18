import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PatientDetailComponent } from './patient-detail.component';
import { PatientNotesComponent } from './patient-notes/patient-notes.component';
import { PatientCallNotesComponent } from './patient-call/patient-call-notes/patient-call-notes.component';
import { PatientCallQuestionsComponent } from './patient-call/patient-call-questions/patient-call-questions.component';
import { PatientSummaryWidgetComponent } from './patient-summary-widget/patient-summary-widget.component';
import { PatientCallHistoryControlsComponent } from './patient-call/patient-call-history-controls/patient-call-history-controls.component';
import { PatientCallHistoryListingComponent } from './patient-call/patient-call-history-listing/patient-call-history-listing.component';
import { PatientCallStatusControlsComponent } from './patient-call/patient-call-status-controls/patient-call-status-controls.component';
import { PatientCallStartButtonComponent } from './patient-call/patient-call-start-button/patient-call-start-button.component';
import { PatientCallStopButtonComponent } from './patient-call/patient-call-stop-button/patient-call-stop-button.component';
import { PatientNextCallSchedulerComponent } from './patient-call/patient-next-call-scheduler/patient-next-call-scheduler.component';
import { PatientNextCallQuestionsComponent } from './patient-call/patient-next-call-questions/patient-next-call-questions.component';
import { FollowupCompleteModalComponent } from './followup-complete-modal/followup-complete-modal.component';
import { FollowupCompleteButtonComponent } from './followup-complete-button/followup-complete-button.component';
import { PatientNextCallFinishButtonComponent } from './patient-call/patient-next-call-finish-button/patient-next-call-finish-button.component';

@NgModule({
  declarations: [
    PatientDetailComponent,
    PatientCallNotesComponent,
    PatientCallQuestionsComponent,
    PatientSummaryWidgetComponent,
    PatientNotesComponent,
    PatientCallHistoryControlsComponent,
    PatientCallHistoryListingComponent,
    PatientCallStatusControlsComponent,
    PatientCallStartButtonComponent,
    PatientCallStopButtonComponent,
    PatientNextCallSchedulerComponent,
    PatientNextCallQuestionsComponent,
    FollowupCompleteModalComponent,
    FollowupCompleteButtonComponent,
    PatientNextCallFinishButtonComponent
  ],
  imports: [CommonModule, RouterModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class PatientDetailModule {}
