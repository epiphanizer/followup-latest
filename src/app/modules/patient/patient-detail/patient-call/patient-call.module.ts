import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientNextCallSchedulerComponent } from './patient-next-call-scheduler/patient-next-call-scheduler.component';
import { PatientNextCallQuestionsComponent } from './patient-next-call-questions/patient-next-call-questions.component';

@NgModule({
  declarations: [PatientNextCallSchedulerComponent, PatientNextCallQuestionsComponent],
  imports: [CommonModule]
})
export class PatientCallModule {}
