import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { OperationFormComponent } from '@app/modules/operation/operation-form/operation-form.component';
import { Shell } from '@app/shell/shell.service';
import { UserRoles } from '@app/modules/user/user';
import { UserResolver } from '../user/user-resolver.service';
import { OperationResolver } from './operation-resolver';
import { OperationListingComponent } from './operation-listing/operation-listing.component';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'operations',
      component: OperationListingComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin],
        title: extract('Operations')
      }
    },
    {
      path: 'operations/group/:operationGroupId',
      component: OperationListingComponent,
      canActivate: [AuthGuardService],
      data: {
        operationGroupId: ':operationGroupId',
        roles: [UserRoles.admin],
        title: extract('Operations')
      }
    },
    {
      path: 'operation/add',
      component: OperationFormComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin],
        title: extract('Add Operation')
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'operation/:operationId',
      component: OperationFormComponent,
      canActivate: [AuthGuardService],
      data: {
        mode: 'view',
        operationId: ':operationId',
        roles: [UserRoles.admin, UserRoles.manager]
      },
      resolve: {
        operation: OperationResolver,
        user: UserResolver
      }
    },
    {
      path: 'operation/add',
      component: OperationFormComponent,
      canActivate: [AuthGuardService],
      data: {
        mode: 'add',
        operationId: ':operationId',
        roles: [UserRoles.admin, UserRoles.manager]
      },
      resolve: {
        operation: OperationResolver,
        user: UserResolver
      }
    },
    {
      path: 'operation/edit/:operationId',
      component: OperationFormComponent,
      canActivate: [AuthGuardService],
      data: {
        mode: 'edit',
        operationId: ':operationId',
        roles: [UserRoles.admin, UserRoles.manager]
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
