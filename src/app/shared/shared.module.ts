import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LoaderComponent } from './loader/loader.component';
import { DialogComponent } from './dialog/dialog.component';

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [LoaderComponent, DialogComponent],
  exports: [LoaderComponent]
})
export class SharedModule {}
