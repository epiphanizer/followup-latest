import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';

import { Shell } from '@app/shell/shell.service';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'team/:teamId/members/:userId',
      pathMatch: 'full',
      component: TeamMemberDetailComponent,
      data: {
        title: extract('Team Member Listing')
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
