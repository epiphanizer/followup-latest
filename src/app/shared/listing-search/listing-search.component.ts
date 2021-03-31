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
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {}
  updateSearchText($event: string) {
    this.searchText = $event;
  }
}
