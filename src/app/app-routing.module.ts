import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  { path: 'call-queue', loadChildren: '@app/modules/call-queue/call-queue.module#CallQueueModule' },
  // Fallback when no prior route is matched

  { path: '**', redirectTo: '', pathMatch: 'full', canActivate: [MsalGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
