import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientComponent } from './patient.component';
import { PatientAvatarComponent } from './patient-avatar/patient-avatar.component';

@NgModule({
  declarations: [PatientComponent, PatientAvatarComponent],
  imports: [CommonModule]
})
export class PatientModule {}
