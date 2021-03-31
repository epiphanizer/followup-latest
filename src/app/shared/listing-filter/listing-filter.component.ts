import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'listing-filter',
  templateUrl: './listing-filter.component.html',
  styleUrls: ['./listing-filter.component.scss']
})
export class ListingFilterComponent implements OnInit, OnChanges {
  @Input() options: Array<any>;
  @Output() sortOptionSelectedEventEmitter: EventEmitter<string> = new EventEmitter();
  @Output() sortDirectionSelectedEventEmitter: EventEmitter<string> = new EventEmitter();

  // either 'asc' or 'desc'
  sortDirection: string;

  selectedOption: string;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}
}
