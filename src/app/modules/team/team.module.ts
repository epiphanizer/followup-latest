import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TeamRoutingModule } from './team-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { TeamMemberDetailComponent } from './team-detail/team-detail.component';

@NgModule({
  declarations: [TeamMemberDetailComponent],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, TeamRoutingModule],
  entryComponents: [TeamMemberDetailComponent],
  exports: [TeamMemberDetailComponent],
  providers: []
})
export class TeamModule {}
