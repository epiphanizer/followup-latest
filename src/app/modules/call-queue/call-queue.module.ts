import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CallQueueRoutingModule } from './call-queue-routing.module';
import { CallQueueComponent } from './call-queue.component';
import { CallQueueCalendarWidgetComponent } from './call-queue-calendar/call-queue-calendar-widget.component';
import { CallQueueSidebarComponent } from './call-queue-sidebar/call-queue-sidebar.component';
import { CallQueueLegendComponent } from './call-queue-legend/call-queue-legend.component';
import { MonthCalendarModule } from 'simple-angular-calendar';
import { CallQueueCallHistoryCalendarComponent } from './call-queue-call-history-calendar/call-queue-call-history-calendar/call-queue-call-history-calendar.component';
import { CallQueuePatientFilterComponent } from './call-queue-patient-filter/call-queue-patient-filter/call-queue-patient-filter.component';
import { CallQueuePatientListingComponent } from './call-queue-patient-listing/call-queue-patient-listing/call-queue-patient-listing.component';

@NgModule({
  imports: [CommonModule, TranslateModule, IonicModule, RouterModule, CallQueueRoutingModule, MonthCalendarModule],

  exports: [CallQueueSidebarComponent],
  declarations: [
    CallQueueComponent,
    CallQueueCalendarWidgetComponent,
    CallQueueSidebarComponent,
    CallQueueLegendComponent,
    CallQueueCallHistoryCalendarComponent,
    CallQueuePatientFilterComponent,
    CallQueuePatientListingComponent
  ],
  providers: []
})
export class CallQueueModule {}
