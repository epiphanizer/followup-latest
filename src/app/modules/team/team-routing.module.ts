import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';
import { TeamListingComponent } from './team-listing/team-listing.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'teams',
      pathMatch: 'full',
      component: TeamListingComponent
    },
    {
      path: 'teams/:teamId',
      pathMatch: 'full',
      component: TeamListingComponent
    },
    {
      path: 'teams/:teamId/members/:teamMemberId',
      pathMatch: 'full',
      component: TeamMemberDetailComponent,
      data: {
        teamId: ':teamId',
        teamMemberId: ':teamMemberId'
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
