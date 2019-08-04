import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ToolbarLogoModule } from './toolbar-logo.module';
import { ToolbarProfileNavModule } from './toolbar-profile-nav.module';
import { UserCorkBoardModule } from './user-cork-board.module';
import { ShellComponent } from './shell.component';
import { UserResolver } from '@app/modules/user/user-resolver.service';

// const routes: Routes = [{ path: '**', component: ShellComponent, resolve: {
//     user: UserResolver
//   }
// }];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    RouterModule,
    // RouterModule.forChild(routes),
    ToolbarLogoModule,
    ToolbarProfileNavModule,
    UserCorkBoardModule
  ],
  entryComponents: [ShellComponent],
  declarations: [ShellComponent]
})
export class ShellModule {}
