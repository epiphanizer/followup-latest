import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { IonicModule } from '@ionic/angular';
import { UserProfileSidebarComponent } from './user-profile-sidebar/user-profile-sidebar.component';
import { UserModule } from '../user.module';

@NgModule({
  declarations: [UserProfileComponent, UserProfileSidebarComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, UserProfileRoutingModule, UserModule]
})
export class UserProfileModule {}
