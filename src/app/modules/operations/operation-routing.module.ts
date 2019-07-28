import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { OperationAddComponent } from './operation-add/operation-add.component';
import { OperationEditComponent } from './operation-edit/operation-edit.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: 'operation', redirectTo: '/call-queue/', pathMatch: 'full' },
    {
      path: 'operation/add',
      component: OperationAddComponent,
      data: {
        title: extract('New Facility')
      }
    },
    {
      path: 'operation/edit',
      component: OperationEditComponent,
      data: {
        title: extract('Edit Facility')
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PatientRoutingModule {}
