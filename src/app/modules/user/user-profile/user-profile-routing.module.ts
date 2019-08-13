import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '@app/modules/user//user-resolver.service';
import { UserProfileComponent } from './user-profile.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'user/profile',
      component: UserProfileComponent,
      data: {
        title: extract('User Profile')
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'user/profile/edit',
      component: UserProfileComponent,
      data: {
        editMode: true
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
