import { NgModule } from '@angular/core';

import { CallQueueComponent } from './call-queue.component';
import { CallQueueCalendarWidgetComponent } from './call-queue-calendar-widget.component';
import { CallQueueSidebarComponent } from './call-queue-sidebar/call-queue-sidebar.component';
import { CallQueueLegendComponent } from './call-queue-legend/call-queue-legend.component';

@NgModule({
  imports: [],
  declarations: [
    CallQueueComponent,
    CallQueueCalendarWidgetComponent,
    CallQueueSidebarComponent,
    CallQueueLegendComponent
  ],
  providers: []
})
export class CallQueueModule {}
