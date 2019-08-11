import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PatientRoutingModule } from './patient-routing.module';
import { PatientCallModule } from './patient-call/patient-call.module';
import { PatientNotesModule } from './patient-notes/patient-notes.module';
import { PatientAvatarModule } from './patient-avatar/patient-avatar.module';
import { PatientDetailModule } from './patient-detail/patient-detail.module';
import { PatientComponent } from './patient.component';
import { PatientAvatarComponent } from '@app/modules/patient/patient-avatar/patient-avatar.component';
import { PatientAddComponent } from '@app/modules/patient/patient-add/patient-add.component';
import { PatientEditComponent } from '@app/modules/patient/patient-edit/patient-edit.component';
import { PatientService } from './patient.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientManagerSidebarComponent } from '@app/modules/patient/patient-manager-sidebar/patient-manager-sidebar.component';

@NgModule({
  declarations: [
    PatientComponent,
    PatientAvatarComponent,
    PatientAddComponent,
    PatientEditComponent,
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
    PatientDetailModule,
    PatientNotesModule,
    PatientAvatarModule
  ],
  entryComponents: [PatientManagerSidebarComponent],
  providers: [PatientService]
})
export class PatientModule {}
