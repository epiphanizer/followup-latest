import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserAddComponent } from '@app/modules/user/user-add/user-add.component';
import { UserEditComponent } from '@app/modules/user/user-edit/user-edit.component';
import { UserDetailComponent } from '@app/modules/user/user-detail/user-detail.component';

@NgModule({
  declarations: [UserAddComponent, UserEditComponent, UserDetailComponent],
  imports: [CommonModule]
})
export class UserModule {}
