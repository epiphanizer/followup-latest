import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { AuthenticationGuard } from 'microsoft-adal-angular6';

const routes: Routes = [
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '/login', pathMatch: 'full', canActivate: [AuthenticationGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
