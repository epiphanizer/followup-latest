import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '/login', pathMatch: 'full', canActivate: [MsalGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
