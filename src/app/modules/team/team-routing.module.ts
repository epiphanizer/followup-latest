import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';
import { TeamListingComponent } from './team-listing/team-listing.component';
import { TeamAccessComponent } from './team-access/team-access.component';
import { UserRoles } from '../user/user';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';
import { UserResolver } from '../user/user-resolver.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'teams',
      pathMatch: 'full',
      component: TeamListingComponent,
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'teams/:teamId',
      pathMatch: 'full',
      component: TeamListingComponent,
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'teams/:teamId/members/:teamMemberId',
      pathMatch: 'full',
      component: TeamMemberDetailComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin, UserRoles.manager],
        teamId: ':teamId',
        teamMemberId: ':teamMemberId'
      },
      resolve: {
        user: UserResolver
      }
    },
    {
      path: 'teams/:teamId/access',
      pathMatch: 'full',
      component: TeamAccessComponent,
      canActivate: [AuthGuardService],
      data: {
        roles: [UserRoles.admin, UserRoles.manager],
        teamId: ':teamId'
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
  providers: []
})
export class TeamRoutingModule {}
