import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientComponent } from './patient.component';
import { PatientAvatarComponent } from '@app/modules/patient/patient-avatar/patient-avatar.component';
import { PatientAddNewFormComponent } from '@app/modules/patient/patient-add-new-form/patient-add-new-form.component';
import { PatientEditFormComponent } from '@app/modules/patient/patient-edit-form/patient-edit-form.component';

@NgModule({
  declarations: [PatientComponent, PatientAvatarComponent, PatientAddNewFormComponent, PatientEditFormComponent],
  imports: [CommonModule]
})
export class PatientModule {}
