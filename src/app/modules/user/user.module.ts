import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDetailComponent } from '@app/modules/user/user-detail/user-detail.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { UserAvatarService } from './user-avatar/user-avatar.service';
import { IonicModule } from '@ionic/angular';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '@app/shared';
import { UserListingComponent } from './user-listing/user-listing.component';
import { UserListingSidebarComponent } from './user-listing/user-listing-sidebar/user-listing-sidebar.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [UserDetailComponent, UserAvatarComponent, UserListingComponent, UserListingSidebarComponent],
  imports: [CommonModule, IonicModule, NgxMaskDirective, NgxMaskPipe, SharedModule, UserRoutingModule],
  exports: [UserDetailComponent, UserAvatarComponent, UserListingComponent, UserListingSidebarComponent],
  providers: [UserAvatarService, NgxImageCompressService]
})
export class UserModule {}
