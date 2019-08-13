import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationAdminComponent } from './operation-admin/operation-admin.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OperationFormComponent, OperationAdminComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class OperationModule {}
