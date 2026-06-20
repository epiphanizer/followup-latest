import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';
import { Shell } from '@app/shell/shell.service';
import { UserRoles } from '../user/user';
import { UserResolver } from '../user/user-resolver.service';
import { UserListingComponent } from './user-listing/user-listing.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'users',
      pathMatch: 'full',
      component: UserListingComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin, UserRoles.manager],
        title: extract('Users Listing')
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
export class UserRoutingModule {}
