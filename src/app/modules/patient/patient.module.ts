import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientRoutingModule } from './patient-routing.module';
import { PatientComponent } from './patient.component';
import { PatientAvatarComponent } from '@app/modules/patient/patient-avatar/patient-avatar.component';
import { PatientAddComponent } from '@app/modules/patient/patient-add/patient-add.component';
import { PatientEditComponent } from '@app/modules/patient/patient-edit/patient-edit.component';

@NgModule({
  declarations: [PatientComponent, PatientAvatarComponent, PatientAddComponent, PatientEditComponent],
  imports: [CommonModule, PatientRoutingModule]
})
export class PatientModule {}
