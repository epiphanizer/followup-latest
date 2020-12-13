import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TeamRoutingModule } from './team-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';
import { TeamListingComponent } from './team-listing/team-listing.component';
import { TeamSidebar } from './team-listing/team-listing-sidebar/team-sidebar.component';

@NgModule({
  declarations: [TeamListingComponent, TeamMemberDetailComponent, TeamSidebar],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, TeamRoutingModule],
  entryComponents: [TeamListingComponent, TeamSidebar],
  exports: [TeamListingComponent, TeamSidebar],
  providers: []
})
export class TeamModule {}
