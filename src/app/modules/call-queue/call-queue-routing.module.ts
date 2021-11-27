import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { CallQueueComponent } from './call-queue.component';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '../user/user-resolver.service';
import { UserRoles } from '../user/user';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/call-queue', pathMatch: 'full' },
    {
      path: 'call-queue',
      component: CallQueueComponent,
      data: {
        title: extract('Call Queue')
      },
      pathMatch: 'full',
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'call-queue/operations/:operationId',
      component: CallQueueComponent,
      data: {
        title: extract('Call Queue')
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'call-queue/spanish',
      component: CallQueueComponent,
      data: {
        title: extract('Call Queue'),
        mode: 'spanish'
      },
      resolve: {
        user: UserResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserResolver]
})
export class CallQueueRoutingModule {}
