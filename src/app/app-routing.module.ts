import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { UserResolver } from './modules/user/user-resolver.service';

const routes: Routes = [
  { path: 'logout', redirectTo: '/login', canActivate: [] },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
    resolve: {
      user: UserResolver
    }
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full',
    resolve: {
      user: UserResolver
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'disabled',
      scrollOffset: [0, 0]
    })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
