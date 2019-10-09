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
      path: '',
      redirectTo: '/home',
      canActivate: [AuthGuardService],
      pathMatch: 'full',
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [AuthGuardService],
      data: {
        title: extract('Follow-Up'),
        navLinks: []
      },
      resolve: {
        user: UserResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserResolver, AuthGuardService]
})
export class HomeRoutingModule {}
