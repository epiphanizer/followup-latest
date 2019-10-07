import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ToolbarProfileNavComponent } from './toolbar-profile-nav.component';
import { UserModule } from '@app/modules/user/user.module';

@NgModule({
  imports: [CommonModule, RouterModule, IonicModule, UserModule],
  exports: [ToolbarProfileNavComponent],
  declarations: [ToolbarProfileNavComponent],
  providers: []
})
export class ToolbarProfileNavModule {}
