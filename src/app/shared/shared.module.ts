import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './loader/loader.component';
import { DialogComponent } from './dialog/dialog.component';
import { JwPaginationComponent } from './pagination/pagination.component';
import { CalendarComponent } from './calendar/calendar.component';
import { nl2brPipe } from './pipes/nl2br.pipe';
import { ListingFilterComponent } from './listing-filter/listing-filter.component';
import { ListingSearchComponent } from './listing-search/listing-search.component';
import { CapitalizeFirstDirective } from './directives/capitalize-first.directive';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [
    LoaderComponent,
    DialogComponent,
    JwPaginationComponent,
    CalendarComponent,
    nl2brPipe,
    ListingFilterComponent,
    ListingSearchComponent,
    CapitalizeFirstDirective
  ],
  exports: [
    LoaderComponent,
    JwPaginationComponent,
    CalendarComponent,
    nl2brPipe,
    ListingFilterComponent,
    ListingSearchComponent,
    CapitalizeFirstDirective
  ]
})
export class SharedModule {}
