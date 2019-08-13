import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from '@app/modules/user/user-profile/user-profile-routing.module';
import { UserDetailComponent } from '@app/modules/user/user-detail/user-detail.component';

@NgModule({
  declarations: [UserDetailComponent],
  imports: [CommonModule, UserProfileRoutingModule]
})
export class UserModule {}
