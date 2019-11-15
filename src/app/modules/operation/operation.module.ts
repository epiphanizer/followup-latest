import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { OperationRoutingModule } from './operation-routing.module';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationAdminComponent } from './operation-admin/operation-admin.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OperationAdminSidebarComponent } from './operation-admin-sidebar/operation-admin-sidebar.component';
import { OperationContactComponent } from './operation-contact/operation-contact.component';
import { OperationAdminRightSidebarComponent } from './operation-admin-right-sidebar/operation-admin-right-sidebar.component';
import { OperationListingComponent } from './operation-listing/operation-listing.component';

@NgModule({
  declarations: [
    OperationFormComponent,
    OperationAdminComponent,
    OperationAdminSidebarComponent,
    OperationContactComponent,
    OperationAdminRightSidebarComponent,
    OperationListingComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule, OperationRoutingModule, ReactiveFormsModule]
})
export class OperationModule {}
