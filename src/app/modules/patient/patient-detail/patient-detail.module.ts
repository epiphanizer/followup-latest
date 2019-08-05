import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PatientDetailComponent } from './patient-detail.component';

@NgModule({
  declarations: [PatientDetailComponent],
  imports: [CommonModule, RouterModule, IonicModule]
})
export class PatientDetailModule {}
