import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ToolbarLogoComponent } from './toolbar-logo.component';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule],
  exports: [ToolbarLogoComponent],
  declarations: [ToolbarLogoComponent],
  providers: []
})
export class ToolbarLogoModule {}
