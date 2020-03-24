import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UserCorkBoardComponent } from './user-cork-board.component';
import { UserCorkBoardObjectComponent } from '../user-cork-board-object/user-cork-board-object.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  exports: [UserCorkBoardComponent],
  declarations: [UserCorkBoardComponent, UserCorkBoardObjectComponent],
  providers: []
})
export class UserCorkBoardModule {}
