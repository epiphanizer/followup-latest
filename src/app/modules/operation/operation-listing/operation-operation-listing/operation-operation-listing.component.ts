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
  public pageOfItems: Operation[];
  public selectedSortFlag: string = 'desc';
  // col definitions
  public colDefs = ['Facility', 'Ownership', 'Queue', 'Notifs', 'Grads', 'Status', 'Date'];
  // Default to facility descending
  public selectedSortCol: string = this.colDefs[0];

  constructor(private operationService: OperationService) {}
  ngOnInit() {
    this.operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(this.operationGroup);
    this.operationGroup.operations$.subscribe((operations: Operation[]) => {
      if (operations[0]) {
        this.operations = operations;
      }
    });
  }

  ngOnChanges(changes: any) {
    if (changes.operationGroup) {
      if (!changes.operationGroup.firstChange) {
        this.operationGroup = changes.operationGroup.currentValue;
        this.operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(this.operationGroup);
        this.operationGroup.operations$.subscribe((operations: Operation[]) => {
          if (operations[0]) {
            this.operations = operations;
          }
        });
      }
    }
  }
  handleSearchFilterEvent($event: KeyboardEvent) {
    this.searchOperations($event);
  }

  handleSortDirectionEvent($event: string) {
    this.selectedSortFlag = $event;
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
    this.runSortSwitch();
  }
  handleSortOptionEvent($event: string) {
    this.selectedSortCol = $event;
    this.runSortSwitch();
  }
  runSortSwitch() {
    console.log('triggered sort switch');
    switch (this.selectedSortCol) {
      case 'Operation':
        this.sortOperationsByOperationName(this.selectedSortFlag);
        break;
      case 'Ownership':
        this.sortOperationsByOwnershipName(this.selectedSortFlag);
        break;
      case 'Queue':
        this.sortOperationsByQueueCount(this.selectedSortFlag);
        break;
      case 'Notifs':
        this.sortOperationsByNotifCount(this.selectedSortFlag);
        break;
      case 'Grads':
        this.sortOperationsByGradCount(this.selectedSortFlag);
        break;
      case 'Status':
        this.sortOperationsByStatus(this.selectedSortFlag);
    }
  }
  sortOperationsByOperationName = function(sortFlag: string) {
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };
  sortOperationsByOwnershipName = function(sortFlag: string) {
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };
  sortOperationsByQueueCount = function(sortFlag: string) {
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };
  sortOperationsByNotifCount = function(sortFlag: string) {
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };
  sortOperationsByGradCount = function(sortFlag: string) {
    if ((this.selectedSortFlag = 'asc')) {
      this.operations.reverse();
    } else {
      this.operations.sort();
    }
  };
  sortOperationsByStatus = function(sortFlag: string) {
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
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }
}
