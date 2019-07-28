import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationComponent } from './notification.component';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { NotificationManagerListingComponent } from './notification-manager-listing/notification-manager-listing.component';

@NgModule({
  declarations: [NotificationComponent, NotificationDetailComponent, NotificationManagerListingComponent],
  imports: [
    CommonModule
    // NotificationRoutingModule
  ]
})
export class NotificationModule {}
