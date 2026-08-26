import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal.component';
import { FormModule } from '@app/shared/form/form.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FormModule, ReactiveFormsModule, SharedModule],
  exports: [],
  declarations: [NotificationModalComponent],
  providers: []
})
export class NotificationModalModule {}
