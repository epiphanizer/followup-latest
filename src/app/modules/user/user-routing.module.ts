import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '../user/user-resolver.service';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';
import { UserRoles } from '../user/user';
import { UserListingComponent } from './user-listing/user-listing.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'users',
      pathMatch: 'full',
      component: UserListingComponent,
      resolve: {
        user: UserResolver
      },
      data: {
        title: extract('Users Listing')
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserResolver]
})
export class UserRoutingModule {}
