import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PatientRoutingModule } from './patient-routing.module';
import { PatientCallModule } from './patient-detail/patient-call/patient-call.module';
import { PatientNotesModule } from './patient-detail/patient-notes/patient-notes.module';
import { PatientComponent } from './patient.component';
import { PatientFormComponent } from '@app/modules/patient/patient-form/patient-form.component';
import { PatientService } from './patient.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientManagerSidebarComponent } from '@app/modules/patient/patient-manager-sidebar/patient-manager-sidebar.component';
import { PatientAvatarComponent } from './patient-avatar/patient-avatar.component';
import { PatientListingComponent } from './patient-listing/patient-listing.component';
import { PatientPatientListingComponent } from './patient-listing/patient-patient-listing/patient-patient-listing.component';
import { FollowupCompleteModalComponent } from './patient-detail/followup-complete-modal/followup-complete-modal.component';
import { FollowupCompleteButtonComponent } from './patient-detail/followup-complete-button/followup-complete-button.component';
import { PatientAvatarUploadComponent } from './patient-avatar-upload/patient-avatar-upload.component';
import { SharedModule } from '@app/shared';
import { PatientListingFilterComponent } from './patient-listing-filter/patient-listing-filter.component';
import { NgxMaskModule } from 'ngx-mask';
import { nl2brPipe } from '@app/shared/pipes/nl2br.pipe';

@NgModule({
  declarations: [
    PatientAvatarComponent,
    PatientComponent,
    PatientListingComponent,
    PatientListingFilterComponent,
    PatientPatientListingComponent,
    PatientFormComponent,
    PatientAvatarUploadComponent,
    PatientManagerSidebarComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    NgxMaskModule.forRoot(),
    ReactiveFormsModule,
    PatientRoutingModule,
    PatientCallModule,
    PatientNotesModule,
    SharedModule
  ],
  entryComponents: [
    PatientManagerSidebarComponent,
    PatientPatientListingComponent,
    PatientListingComponent,
    PatientListingFilterComponent,
    PatientAvatarComponent,
    FollowupCompleteModalComponent,
    FollowupCompleteButtonComponent
  ],
  exports: [PatientAvatarComponent, PatientListingFilterComponent],
  providers: [PatientService]
})
export class PatientModule {}
