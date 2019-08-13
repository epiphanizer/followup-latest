import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserResolver } from '@app/modules/user/user-resolver.service';
import { NotificationListingComponent } from './notification-listing/notification-listing.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'notifications',
      component: NotificationListingComponent,
      pathMatch: 'full',
      resolve: {
        user: UserResolver
      },
      canActivate: [MsalGuard]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [
    UserResolver,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }
  ]
})
export class NotificationRoutingModule {}
