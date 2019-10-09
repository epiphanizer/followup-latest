import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { UserResolver } from './modules/user/user-resolver.service';
import { AuthGuardService } from './core/authentication/auth-guard.service';

const routes: Routes = [
  { path: 'logout', redirectTo: '/login', canActivate: [] },

  {
    path: '**',
    redirectTo: '/home',
    canActivate: [AuthGuardService],
    pathMatch: 'full',
    resolve: {
      user: UserResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [UserResolver, AuthGuardService]
})
export class AppRoutingModule {}
