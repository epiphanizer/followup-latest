import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TeamRoutingModule } from './team-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';

@NgModule({
  declarations: [],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule, TeamRoutingModule],
  entryComponents: [],
  exports: [],
  providers: []
})
export class TeamModule {}
