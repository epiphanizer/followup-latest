import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { NotificationListingComponent } from './notification-listing/notification-listing.component';
import { NotificationPatientListingComponent } from './notification-listing/notification-patient-listing/notification-patient-listing.component';
import { NotificationListingSidebarComponent } from './notification-listing/notification-listing-sidebar/notification-listing-sidebar.component';
import { IonicModule } from '@ionic/angular';
import { NotificationStatusLegendComponent } from './notification-listing/notification-status-legend/notification-status-legend.component';
import { PatientModule } from '../patient/patient.module';
import { SharedModule } from '@app/shared';
import { NotificationListingFilterComponent } from './notification-listing-filter/notification-listing-filter.component';

@NgModule({
  declarations: [
    NotificationDetailComponent,
    NotificationListingComponent,
    NotificationListingSidebarComponent,
    NotificationPatientListingComponent,
    NotificationListingFilterComponent,
    NotificationStatusLegendComponent
  ],
  imports: [CommonModule, IonicModule, NotificationRoutingModule, PatientModule, SharedModule]
})
export class NotificationModule {}
