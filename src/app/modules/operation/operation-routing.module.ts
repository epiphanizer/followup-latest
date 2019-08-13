import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { OperationFormComponent } from '@app/modules/operation/operation-form/operation-form.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: 'operation', redirectTo: '/call-queue/', pathMatch: 'full' },
    {
      path: 'operation/add',
      component: OperationFormComponent,
      data: {
        title: extract('New Facility')
      }
    },
    {
      path: 'operation/edit/:operationId',
      component: OperationFormComponent,
      data: {
        editMode: true,
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
export class OperationRoutingModule {}
