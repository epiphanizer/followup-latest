import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TeamMessageModalComponent } from './team-message-modal.component';
import { FormModule } from '@app/shared/form/form.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FormModule, ReactiveFormsModule],
  exports: [],
  declarations: [TeamMessageModalComponent],
  providers: []
})
export class TeamMessageModalModule {}
