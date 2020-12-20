import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  selector: 'app-operation-operation-listing',
  templateUrl: './operation-operation-listing.component.html',
  styleUrls: ['./operation-operation-listing.component.scss']
})
export class OperationOperationListingComponent implements OnInit {
  @Input() operationGroup: OperationGroup;
  public operations: Operation[];
  public operations$: Observable<Operation[]>;
  public operationsFiltered: Operation[];
  public filterBy: string = 'operation-name';
  public selectedSortFlag: string = 'desc';

  constructor(private operationService: OperationService) {}
  ngOnInit() {
    this.operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(this.operationGroup);
  }

  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
    // Only option
    this.sortOperationsByOperationName(this.selectedSortFlag);
  }
  sortOperationsByOperationName = function(sortFlag: string) {
    this.filterBy = 'operation-name';
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };

  sortOperationsByOperationStatus = function(sortFlag: string) {
    this.filterBy = 'operation-status';
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };
  searchOperations($event: KeyboardEvent): Operation[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.operationsFiltered = this.operations.filter((operation: Operation) => {
      let operationName = operation.operationName;
      return operationName.toLowerCase().includes(searchText);
    });
    return this.operationsFiltered;
  }
}
