import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { UserResolver } from '@app/modules/user/user-resolver.service';
import { NotificationResolver } from '@app/modules/notification/notification-resolver.service';
import { NotificationListingComponent } from './notification-listing/notification-listing.component';
import { Shell } from '@app/shell/shell.service';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { OperationResolver } from '../operation/operation-resolver';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'notifications',
      component: NotificationListingComponent,
      pathMatch: 'full',
      data: {},
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'operations/:operationId/notifications',
      component: NotificationListingComponent,
      pathMatch: 'full',
      data: {},
      resolve: {
        operation: OperationResolver,
        user: UserResolver
      }
    },
    {
      path: 'notifications/:notificationId',
      component: NotificationDetailComponent,
      pathMatch: 'full',
      resolve: {
        notification: NotificationResolver,
        user: UserResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [UserResolver, NotificationResolver]
})
export class NotificationRoutingModule {}
