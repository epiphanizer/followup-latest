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
  public filterBy: string = 'operation-name';
  public selectedSortFlag: string = 'desc';

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

  sortOperationsByStatus = function(sortFlag: string) {
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
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }
}
