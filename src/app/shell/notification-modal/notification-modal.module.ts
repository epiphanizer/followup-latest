import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal.component';
import { FormModule } from '@app/shared/form/form.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FormModule, ReactiveFormsModule],
  exports: [],
  declarations: [NotificationModalComponent],
  providers: []
})
export class NotificationModalModule {}
