import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '@app/modules/user/user-resolver.service';
import { UserRoles } from '@app/modules/user/user';
import { UserProfileComponent } from './user-profile.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'user/profile',
      component: UserProfileComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin, UserRoles.manager, UserRoles.user],
        title: extract('User Profile')
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'users/:userId',
      component: UserProfileComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin, UserRoles.manager],
        title: extract('Edit User')
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
  providers: [UserResolver]
})
export class UserProfileRoutingModule {}
