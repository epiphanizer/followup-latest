import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ToolbarProfileNavComponent } from './toolbar-profile-nav.component';

@NgModule({
  imports: [CommonModule, RouterModule, IonicModule],
  exports: [ToolbarProfileNavComponent],
  declarations: [ToolbarProfileNavComponent],
  providers: []
})
export class ToolbarProfileNavModule {}
