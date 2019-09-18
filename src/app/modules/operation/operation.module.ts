import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { OperationRoutingModule } from './operation-routing.module';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationAdminComponent } from './operation-admin/operation-admin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OperationAdminSidebarComponent } from './operation-admin-sidebar/operation-admin-sidebar.component';
import { OperationContactComponent } from './operation-contact/operation-contact.component';

@NgModule({
  declarations: [
    OperationFormComponent,
    OperationAdminComponent,
    OperationAdminSidebarComponent,
    OperationContactComponent
  ],
  imports: [CommonModule, IonicModule, OperationRoutingModule, ReactiveFormsModule]
})
export class OperationModule {}
