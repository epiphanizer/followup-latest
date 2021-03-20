import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoaderComponent } from './loader/loader.component';
import { DialogComponent } from './dialog/dialog.component';
import { JwPaginationComponent } from './pagination/pagination.component';
import { CalendarComponent } from './calendar/calendar.component';
import { nl2brPipe } from './pipes/nl2br.pipe';

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [LoaderComponent, DialogComponent, JwPaginationComponent, CalendarComponent, nl2brPipe],
  exports: [LoaderComponent, JwPaginationComponent, CalendarComponent, nl2brPipe]
})
export class SharedModule {}
