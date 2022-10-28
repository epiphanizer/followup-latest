import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { User } from '@app/modules/user/user';

@Component({
  selector: 'app-operation-operation-listing',
  templateUrl: './operation-operation-listing.component.html',
  styleUrls: ['./operation-operation-listing.component.scss']
})
export class OperationOperationListingComponent implements OnInit {
  @Input() operationGroup: OperationGroup;
  public operations: Operation[];
  public operationsFiltered: Operation[];
  public pageOfItems: Operation[];
  public selectedSortFlag: string = 'desc';
  private user: User;
  // col definitions
  public colDefs = ['Facility', 'Ownership', 'Queue', 'Notifs', 'Grads', 'Status', 'Date'];
  // Default to facility descending
  public selectedSortCol: string = this.colDefs[0];

  constructor(public route: ActivatedRoute) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.operationsFiltered = this.operations = this.user.operations.filter((operation: Operation) => {
      return operation.operationGroupId == this.operationGroup.operationGroupId;
    });
    this.runSortSwitch();
  }

  ngOnChanges(changes: any) {
    if (changes.operationGroup) {
      if (!changes.operationGroup.currentValue.firstChange) {
        this.operationGroup = changes.operationGroup.currentValue;
        this.operationsFiltered = this.operations = this.operationGroup.operations;
        this.runSortSwitch();
      }
    }
  }
  handleSearchFilterEvent($event: string) {
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
        break;
      case 'Date':
        this.sortOperationsByStartDate();
        break;
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
    if (this.selectedSortFlag == 'desc') {
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
    if (this.selectedSortFlag == 'desc') {
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
    if (this.selectedSortFlag == 'desc') {
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
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>a.operationActive - b.operationActive;
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>b.operationActive - a.operationActive;
        })
        .slice();
    }
  };
  sortOperationsByStartDate = function() {
    if (this.selectedSortFlag == 'desc') {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>new Date(a.operationStartDate) - <any>new Date(b.operationActive);
        })
        .slice();
    } else {
      this.operationsFiltered = this.operations
        .sort((a: Operation, b: Operation) => {
          return <any>new Date(b.operationActive) - <any>new Date(a.operationActive);
        })
        .slice();
    }
  };
  searchOperations($event: string): Operation[] {
    let searchText = $event;
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
