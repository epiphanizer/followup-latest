import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  providers: [],
  selector: 'app-listing-search',
  templateUrl: './listing-search.component.html',
  styleUrls: ['./listing-search.component.scss']
})
export class ListingSearchComponent implements OnInit {
  searchText: string = '';
  @Output() searchFilterEventEmitted: EventEmitter<string> = new EventEmitter();

  constructor() {}

  timeout: any = null;
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {}

  updateSearchText($event: any) {
    // Clear the timeout if it has already been set.
    // This will prevent the previous task from executing
    // if it has been less than <MILLISECONDS>
    clearTimeout(this.timeout);

    // Make a new timeout set to go off in 1000ms (1 second)
    this.timeout = setTimeout(
      function() {
        this.searchText = $event.target.value;
        this.searchFilterEventEmitted.emit(this.searchText);
      }.bind(this),
      1000
    );
  }
}
