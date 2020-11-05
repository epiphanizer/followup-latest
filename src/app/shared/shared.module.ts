import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoaderComponent } from './loader/loader.component';
import { DialogComponent } from './dialog/dialog.component';
import { JwPaginationModule, JwPaginationComponent } from 'jw-angular-pagination';

@NgModule({
  imports: [IonicModule, CommonModule, JwPaginationModule],
  declarations: [LoaderComponent, DialogComponent, JwPaginationComponent],
  exports: [LoaderComponent]
})
export class SharedModule {}
