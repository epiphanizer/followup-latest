import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CallQueueRoutingModule } from './call-queue-routing.module';
import { CallQueueComponent } from './call-queue.component';
import { CallQueueSidebarComponent } from './call-queue-sidebar/call-queue-sidebar.component';
import { CallQueueLegendComponent } from './call-queue-legend/call-queue-legend.component';
import { CallQueueCallHistoryCalendarComponent } from './call-queue-call-history-calendar/call-queue-call-history-calendar/call-queue-call-history-calendar.component';
import { CallQueuePatientFilterComponent } from './call-queue-patient-filter/call-queue-patient-filter/call-queue-patient-filter.component';
import { CallQueuePatientListingComponent } from './call-queue-patient-listing/call-queue-patient-listing.component';
import { PatientModule } from '../patient/patient.module';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [CommonModule, IonicModule, PatientModule, RouterModule, SharedModule, CallQueueRoutingModule],
  exports: [CallQueueSidebarComponent],
  declarations: [
    CallQueueComponent,
    CallQueueSidebarComponent,
    CallQueueLegendComponent,
    CallQueueCallHistoryCalendarComponent,
    CallQueuePatientFilterComponent,
    CallQueuePatientListingComponent
  ],
  entryComponents: [],
  providers: []
})
export class CallQueueModule {}
