import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperationEditComponent } from './operation-edit/operation-edit.component';
import { OperationAdminComponent } from './operation-admin/operation-admin.component';

@NgModule({
  declarations: [OperationEditComponent, OperationAdminComponent],
  imports: [CommonModule]
})
export class OperationModule {}
