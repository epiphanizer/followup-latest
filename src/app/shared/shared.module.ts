import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoaderComponent } from './loader/loader.component';
import { DialogComponent } from './dialog/dialog.component';
import { JwPaginationComponent } from './pagination/pagination.component';

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [LoaderComponent, DialogComponent, JwPaginationComponent],
  exports: [LoaderComponent, JwPaginationComponent]
})
export class SharedModule {}
