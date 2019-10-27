import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { IonicModule } from '@ionic/angular';
import { UserProfileSidebarComponent } from './user-profile-sidebar/user-profile-sidebar.component';
import { UserModule } from '../user.module';

@NgModule({
  declarations: [UserProfileComponent, UserProfileSidebarComponent],
  imports: [UserModule, IonicModule, CommonModule, ReactiveFormsModule],
  entryComponents: [UserProfileSidebarComponent],
  exports: [UserProfileComponent]
})
export class UserProfileModule {}
