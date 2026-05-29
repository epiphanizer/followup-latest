import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ToolbarLogoModule } from './toolbar-logo/toolbar-logo.module';
import { ToolbarProfileNavModule } from './toolbar-profile-nav/toolbar-profile-nav.module';
import { UserCorkBoardModule } from './user-cork-board/user-cork-board.module';
import { ShellComponent } from './shell.component';
import { ToolbarNavComponent } from './toolbar-nav/toolbar-nav.component';
import { NotificationModalModule } from './notification-modal/notification-modal.module';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    ReactiveFormsModule,
    NotificationModalModule,
    RouterModule,
    ToolbarLogoModule,
    ToolbarProfileNavModule,
    UserCorkBoardModule
  ],
  declarations: [ShellComponent, ToolbarNavComponent]
})
export class ShellModule {}
