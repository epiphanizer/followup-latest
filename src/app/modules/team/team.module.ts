import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TeamRoutingModule } from './team-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';
import { TeamListingComponent } from './team-listing/team-listing.component';
import { TeamListingSidebar } from './team-listing/team-listing-sidebar/team-listing-sidebar.component';
import { TeamMembersListingComponent } from './team-listing/team-members-listing/team-members-listing.component';

@NgModule({
  declarations: [TeamListingComponent, TeamMembersListingComponent, TeamMemberDetailComponent, TeamListingSidebar],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, TeamRoutingModule],
  entryComponents: [TeamListingSidebar],
  exports: [TeamListingComponent, TeamMembersListingComponent, TeamListingSidebar],
  providers: []
})
export class TeamModule {}
