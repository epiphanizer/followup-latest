import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { IonicModule } from '@ionic/angular';
import { UserModule } from '../user.module';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [UserProfileComponent],
  imports: [UserModule, IonicModule, CommonModule, NgxMaskModule.forRoot(), ReactiveFormsModule],
  entryComponents: [],
  exports: [UserProfileComponent]
})
export class UserProfileModule {}
