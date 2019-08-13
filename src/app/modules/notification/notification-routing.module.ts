import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserResolver } from '@app/modules/user/user-resolver.service';
import { NotificationManagerListingComponent } from './notification-manager-listing/notification-manager-listing.component';

const routes: Routes = [
  {
    path: 'manager/notifications',
    component: NotificationManagerListingComponent,
    pathMatch: 'full',
    resolve: {
      user: UserResolver
    },
    canActivate: [MsalGuard]
  }
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
