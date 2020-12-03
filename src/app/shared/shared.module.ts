import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoaderComponent } from './loader/loader.component';
import { DialogComponent } from './dialog/dialog.component';
import { JwPaginationComponent } from './pagination/pagination.component';
import { CalendarComponent } from './calendar/calendar.component';

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [LoaderComponent, DialogComponent, JwPaginationComponent, CalendarComponent],
  exports: [LoaderComponent, JwPaginationComponent, CalendarComponent]
})
export class SharedModule {}
