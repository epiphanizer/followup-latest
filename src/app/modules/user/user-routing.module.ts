import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { Shell } from '@app/shell/shell.service';
import { UserResolver } from '../user/user-resolver.service';
import { UserListingComponent } from './user-listing/user-listing.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'users',
      pathMatch: 'full',
      component: UserListingComponent,
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
