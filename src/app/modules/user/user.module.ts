import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from '@app/modules/user/user-profile/user-profile-routing.module';
import { UserAddComponent } from '@app/modules/user/user-add/user-add.component';
import { UserEditComponent } from '@app/modules/user/user-edit/user-edit.component';
import { UserDetailComponent } from '@app/modules/user/user-detail/user-detail.component';

@NgModule({
  declarations: [UserAddComponent, UserEditComponent, UserDetailComponent],
  imports: [CommonModule, UserProfileRoutingModule]
})
export class UserModule {}
