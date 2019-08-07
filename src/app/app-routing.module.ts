import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { UserResolver } from './modules/user/user-resolver.service';

const routes: Routes = [
  { path: 'logout', redirectTo: '/login', canActivate: [] },
  { path: 'login', component: LoginComponent, canActivate: [] },
  {
    path: '**',
    redirectTo: '',
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
