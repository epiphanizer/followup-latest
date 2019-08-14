import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UserCorkBoardComponent } from './user-cork-board.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  exports: [UserCorkBoardComponent],
  declarations: [UserCorkBoardComponent],
  providers: []
})
export class UserCorkBoardModule {}
