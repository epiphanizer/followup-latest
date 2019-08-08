import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '../user/user-resolver.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: '/user/profile',
      component: UserProfileComponent,
      data: {
        title: extract('Call Queue')
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'call-queue/:operationId',
      component: CallQueueComponent,
      data: {
        title: extract('Call Queue')
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
