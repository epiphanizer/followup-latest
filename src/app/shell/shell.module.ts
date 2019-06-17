import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ToolbarLogoModule } from './toolbar-logo.module';
import { ShellComponent } from './shell.component';

@NgModule({
  imports: [CommonModule, TranslateModule, IonicModule, RouterModule, ToolbarLogoModule],
  entryComponents: [ShellComponent],
  declarations: [ShellComponent]
})
export class ShellModule {}
