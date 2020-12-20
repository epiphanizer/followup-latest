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
import { OperationOperationListingComponent } from './operation-listing/operation-operation-listing/operation-operation-listing.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [
    OperationFormComponent,
    OperationAdminComponent,
    OperationAdminSidebarComponent,
    OperationContactComponent,
    OperationAdminRightSidebarComponent,
    OperationListingComponent,
    OperationOperationListingComponent
  ],
  entryComponents: [OperationOperationListingComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NgxMaskModule.forRoot(),
    OperationRoutingModule,
    ReactiveFormsModule
  ]
})
export class OperationModule {}
