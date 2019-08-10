import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserResolver } from './modules/user/user-resolver.service';

const routes: Routes = [
  { path: 'logout', redirectTo: '/login', canActivate: [] },
  {
    path: '**',
    redirectTo: '/home',
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
export class AppRoutingModule {}
