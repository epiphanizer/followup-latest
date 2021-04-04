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
        this.operationsFiltered = this.operations = operations;
        this.runSortSwitch();
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
      this.selectedSortFlag = 'asc';
    } else {
      this.selectedSortFlag = 'desc';
    }
    this.runSortSwitch();
  }
  handleSortOptionEvent($event: string) {
    this.selectedSortCol = $event;
    this.runSortSwitch();
  }
  runSortSwitch() {
    console.log('triggered sort switch for ' + this.selectedSortCol + ' by: ' + this.selectedSortFlag);
    switch (this.selectedSortCol) {
      case 'Facility':
        this.sortOperationsByOperationName();
        break;
      case 'Ownership':
        this.sortOperationsByOwnershipName();
        break;
      case 'Queue':
        this.sortOperationsByQueueCount();
        break;
      case 'Notifs':
        this.sortOperationsByNotifCount();
        break;
      case 'Grads':
        this.sortOperationsByGradCount();
        break;
      case 'Status':
        this.sortOperationsByStatus();
    }
  }

  sortOperationsByOperationName = function() {
    if (this.selectedSortFlag == 'desc') {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>a.operationName.localeCompare(b.operationName);
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>b.operationName.localeCompare(a.operationName);
        })
        .slice();
    }
  };
  sortOperationsByOwnershipName = function() {
    if (this.selectedSortFlag == 'desc') {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>a.operationGroupName.localeCompare(b.operationGroupName);
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>b.operationGroupName.localeCompare(a.operationGroupName);
        })
        .slice();
    }
  };
  sortOperationsByQueueCount = function() {
    if ((this.selectedSortFlag = 'desc')) {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>b.currentAssignedPatientCount - a.currentAssignedPatientCount;
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>a.currentAssignedPatientCount - b.currentAssignedPatientCount;
        })
        .slice();
    }
  };
  sortOperationsByNotifCount = function() {
    if ((this.selectedSortFlag = 'desc')) {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>b.totalNotifications - a.totalNotifications;
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>a.totalNotifications - b.totalNotifications;
        })
        .slice();
    }
  };
  sortOperationsByGradCount = function() {
    if ((this.selectedSortFlag = 'desc')) {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>b.totalGraduates - a.totalGraduates;
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>a.totalGraduates - b.totalGraduates;
        })
        .slice();
    }
  };
  sortOperationsByStatus = function() {
    if (this.selectedSortFlag == 'desc') {
      this.patientsFiltered = this.patients
        .sort((a: Operation, b: Operation) => {
          return <any>a.operationActive > b.operationActive;
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Operation, b: Operation) => {
          return <any>b.operationActive > a.operationActive;
        })
        .slice();
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
