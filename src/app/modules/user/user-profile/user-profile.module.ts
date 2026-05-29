import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { IonicModule } from '@ionic/angular';
import { UserModule } from '../user.module';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { TeamModule } from '@app/modules/team/team.module';
import { SharedModule } from '@app/shared';
import { UserProfileRoutingModule } from './user-profile-routing.module';

@NgModule({
  declarations: [UserProfileComponent],
  imports: [
    UserModule,
    IonicModule,
    CommonModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ReactiveFormsModule,
    TeamModule,
    SharedModule,
    UserProfileRoutingModule
  ],
  exports: [UserProfileComponent]
})
export class UserProfileModule {}
