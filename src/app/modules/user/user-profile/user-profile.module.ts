import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { IonicModule } from '@ionic/angular';
import { UserModule } from '../user.module';
import { NgxMaskModule } from 'ngx-mask';
import { TeamListingSidebar } from '@app/modules/team/team-listing/team-listing-sidebar/team-listing-sidebar.component';
import { TeamModule } from '@app/modules/team/team.module';
import { SharedModule } from '@app/shared';
import { UserProfileRoutingModule } from './user-profile-routing.module';

@NgModule({
  declarations: [UserProfileComponent],
  imports: [
    UserModule,
    IonicModule,
    CommonModule,
    NgxMaskModule.forRoot(),
    ReactiveFormsModule,
    TeamModule,
    SharedModule,
    UserProfileRoutingModule
  ],
  entryComponents: [TeamListingSidebar],
  exports: [UserProfileComponent]
})
export class UserProfileModule {}
