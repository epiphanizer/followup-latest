import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [UserProfileComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, UserProfileRoutingModule]
})
export class UserProfileModule {}
