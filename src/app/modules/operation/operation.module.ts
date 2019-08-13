import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationAdminComponent } from './operation-admin/operation-admin.component';

@NgModule({
  declarations: [OperationFormComponent, OperationAdminComponent],
  imports: [CommonModule]
})
export class OperationModule {}
