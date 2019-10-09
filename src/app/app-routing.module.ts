import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuardService } from './core/authentication/auth-guard.service';

const routes: Routes = [
  { path: 'logout', redirectTo: '/login', canActivate: [] },

  {
    path: '**',
    redirectTo: '/home',
    canActivate: [AuthGuardService],
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [AuthGuardService]
})
export class AppRoutingModule {}
