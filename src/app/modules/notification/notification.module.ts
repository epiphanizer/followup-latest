import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationComponent } from './notification.component';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { NotificationListingComponent } from './notification-listing/notification-listing.component';
import { NotificationPatientListingComponent } from './notification-listing/notification-patient-listing/notification-patient-listing.component';
import { NotificationListingSidebarComponent } from './notification-listing/notification-listing-sidebar/notification-listing-sidebar.component';
import { IonicModule } from '@ionic/angular';
import { NotificationStatusLegendComponent } from './notification-listing/notification-status-legend/notification-status-legend.component';

@NgModule({
  declarations: [
    NotificationComponent,
    NotificationDetailComponent,
    NotificationListingComponent,
    NotificationListingSidebarComponent,
    NotificationPatientListingComponent,
    NotificationStatusLegendComponent
  ],
  imports: [CommonModule, IonicModule, NotificationRoutingModule]
})
export class NotificationModule {}
