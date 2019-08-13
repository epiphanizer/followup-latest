import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationComponent } from './notification.component';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { NotificationListingComponent } from './notification-listing/notification-listing.component';

@NgModule({
  declarations: [NotificationComponent, NotificationDetailComponent, NotificationListingComponent],
  imports: [CommonModule, NotificationRoutingModule]
})
export class NotificationModule {}
