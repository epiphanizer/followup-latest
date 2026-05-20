import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { NotificationListingComponent } from './notification-listing/notification-listing.component';
import { NotificationPatientListingComponent } from './notification-listing/notification-patient-listing/notification-patient-listing.component';
import { NotificationListingSidebarComponent } from './notification-listing/notification-listing-sidebar/notification-listing-sidebar.component';
import { NotificationReplyModalComponent } from './notification-reply-modal/notification-reply-modal.component';
import { IonicModule } from '@ionic/angular';
import { PatientModule } from '../patient/patient.module';
import { SharedModule } from '@app/shared';
@NgModule({
  declarations: [
    NotificationDetailComponent,
    NotificationListingComponent,
    NotificationListingSidebarComponent,
    NotificationPatientListingComponent,
    NotificationReplyModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    NotificationRoutingModule,
    PatientModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class NotificationModule {}
