import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { HomeComponent } from './home.component';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '@app/modules/user/user-resolver.service';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'home',
      component: HomeComponent,
      data: { title: extract('Follow-Up') },
      resolve: {
        user: UserResolver
      },
      canActivate: [AuthGuardService]
    },
    {
      path: '**',
      redirectTo: '/home'
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserResolver]
})
export class HomeRoutingModule {}
