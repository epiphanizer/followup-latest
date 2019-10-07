import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from '@app/modules/user/user-profile/user-profile-routing.module';
import { UserDetailComponent } from '@app/modules/user/user-detail/user-detail.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { UserAvatarService } from './user-avatar/user-avatar.service';

@NgModule({
  declarations: [UserDetailComponent, UserAvatarComponent],
  imports: [CommonModule, UserProfileRoutingModule],
  exports: [UserAvatarComponent],
  providers: [UserAvatarService]
})
export class UserModule {}
