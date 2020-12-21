import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';

import { Shell } from '@app/shell/shell.service';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';
import { TeamListingComponent } from './team-listing/team-listing.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'teams',
      pathMatch: 'full',
      component: TeamListingComponent,
      data: {
        title: extract('Team Listing')
      }
    },
    {
      path: 'teams/:teamId',
      pathMatch: 'full',
      component: TeamListingComponent,
      data: {
        title: extract('Team Listing')
      }
    },
    {
      path: 'teams/:teamId/members/:userId',
      pathMatch: 'full',
      component: TeamMemberDetailComponent,
      data: {
        title: extract('Team Member Detail')
      }
    }
  ])
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
    // NgxMaskModule.forRoot()
  ],
  exports: [RouterModule],
  providers: []
})
export class TeamRoutingModule {}
