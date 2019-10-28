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

@NgModule({
  declarations: [
    PatientAvatarComponent,
    PatientComponent,
    PatientListingComponent,
    PatientFormComponent,
    PatientManagerSidebarComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PatientRoutingModule,
    PatientCallModule,
    PatientNotesModule
  ],
  entryComponents: [PatientManagerSidebarComponent, PatientAvatarComponent],
  exports: [PatientAvatarComponent],
  providers: [PatientService]
})
export class PatientModule {}
