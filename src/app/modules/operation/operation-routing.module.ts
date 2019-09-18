import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { OperationFormComponent } from '@app/modules/operation/operation-form/operation-form.component';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '../user/user-resolver.service';
import { OperationResolver } from './operation-resolver';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'operation/add',
      component: OperationFormComponent,
      data: {
        title: extract('New Facility')
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'operation/edit/:operationId',
      component: OperationFormComponent,
      data: {
        editMode: true,
        operationId: ':operationId'
      },
      resolve: {
        operation: OperationResolver,
        user: UserResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OperationResolver, UserResolver]
})
export class OperationRoutingModule {}
