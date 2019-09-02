import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal.component';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule],
  exports: [],
  declarations: [NotificationModalComponent],
  providers: []
})
export class NotificationModalModule {}
