import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CallQueueRoutingModule } from './call-queue-routing.module';
import { CallQueueComponent } from './call-queue.component';
import { CallQueueCalendarWidgetComponent } from './call-queue-calendar-widget.component';
import { CallQueueSidebarComponent } from './call-queue-sidebar/call-queue-sidebar.component';
import { CallQueueLegendComponent } from './call-queue-legend/call-queue-legend.component';
import { MonthCalendarModule } from 'simple-angular-calendar';

@NgModule({
  imports: [CommonModule, TranslateModule, IonicModule, RouterModule, CallQueueRoutingModule, MonthCalendarModule],

  exports: [CallQueueSidebarComponent],
  declarations: [
    CallQueueComponent,
    CallQueueCalendarWidgetComponent,
    CallQueueSidebarComponent,
    CallQueueLegendComponent
  ],
  providers: []
})
export class CallQueueModule {}
