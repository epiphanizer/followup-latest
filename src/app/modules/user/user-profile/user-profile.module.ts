import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { IonicModule } from '@ionic/angular';
import { UserProfileSidebarComponent } from './user-profile-sidebar/user-profile-sidebar.component';
import { UserModule } from '../user.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [UserProfileComponent, UserProfileSidebarComponent],
  imports: [UserModule, IonicModule, CommonModule, NgxMaskModule.forRoot(), ReactiveFormsModule],
  entryComponents: [UserProfileSidebarComponent],
  exports: [UserProfileComponent, UserProfileSidebarComponent]
})
export class UserProfileModule {}
