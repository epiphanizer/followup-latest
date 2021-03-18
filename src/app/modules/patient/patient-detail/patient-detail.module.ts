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
import { PatientCallStatusControlsComponent } from './patient-call/patient-call-status-controls/patient-call-status-controls.component';
import { PatientCallStartButtonComponent } from './patient-call/patient-call-start-button/patient-call-start-button.component';
import { PatientCallStopButtonComponent } from './patient-call/patient-call-stop-button/patient-call-stop-button.component';
import { PatientNextCallSchedulerComponent } from './patient-call/patient-next-call-scheduler/patient-next-call-scheduler.component';
import { PatientNextCallQuestionsComponent } from './patient-call/patient-next-call-questions/patient-next-call-questions.component';
import { FollowupCompleteModalComponent } from './followup-complete-modal/followup-complete-modal.component';
import { FollowupCompleteButtonComponent } from './followup-complete-button/followup-complete-button.component';
import { PatientNextCallFinishButtonComponent } from './patient-call/patient-next-call-finish-button/patient-next-call-finish-button.component';
import { PatientModule } from '../patient.module';
import { PatientAvatarComponent } from '../patient-avatar/patient-avatar.component';
import { PatientIntakeQuestionComponent } from '../patient-intake-question/patient-intake-question.component';
import { PatientHistoryListingComponent } from './patient-history-listing/patient-history-listing.component';
import { SharedModule } from '@app/shared';

@NgModule({
  declarations: [
    FollowupCompleteModalComponent,
    FollowupCompleteButtonComponent,
    PatientDetailComponent,
    PatientCallNotesComponent,
    PatientCallQuestionsComponent,
    PatientIntakeQuestionComponent,
    PatientSummaryWidgetComponent,
    PatientNotesComponent,
    PatientHistoryListingComponent,
    PatientCallStatusControlsComponent,
    PatientCallStartButtonComponent,
    PatientCallStopButtonComponent,
    PatientNextCallSchedulerComponent,
    PatientNextCallQuestionsComponent,
    PatientNextCallFinishButtonComponent
  ],
  imports: [CommonModule, PatientModule, RouterModule, IonicModule, FormsModule, ReactiveFormsModule, SharedModule],
  entryComponents: [
    PatientAvatarComponent,
    PatientDetailComponent,
    FollowupCompleteModalComponent,
    FollowupCompleteButtonComponent
  ]
})
export class PatientDetailModule {}
