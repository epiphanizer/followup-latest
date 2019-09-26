import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PatientRoutingModule } from './patient-routing.module';
import { PatientCallModule } from './patient-detail/patient-call/patient-call.module';
import { PatientNotesModule } from './patient-detail/patient-notes/patient-notes.module';
import { PatientDetailModule } from './patient-detail/patient-detail.module';
import { PatientComponent } from './patient.component';
import { PatientFormComponent } from '@app/modules/patient/patient-form/patient-form.component';
import { PatientService } from './patient.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientManagerSidebarComponent } from '@app/modules/patient/patient-manager-sidebar/patient-manager-sidebar.component';
import { PatientQuestionComponent } from './patient-question/patient-question.component';
import { FollowupCompleteModalComponent } from './patient-detail/followup-complete-modal/followup-complete-modal.component';

@NgModule({
  declarations: [PatientComponent, PatientFormComponent, PatientManagerSidebarComponent, PatientQuestionComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PatientRoutingModule,
    PatientCallModule,
    PatientDetailModule,
    PatientNotesModule
  ],
  entryComponents: [PatientManagerSidebarComponent, FollowupCompleteModalComponent],
  providers: [PatientService]
})
export class PatientModule {}
