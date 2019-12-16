import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Operation } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  selector: 'app-operation-operation-listing',
  templateUrl: './operation-operation-listing.component.html',
  styleUrls: ['./operation-operation-listing.component.scss']
})
export class OperationOperationListingComponent implements OnInit {
  @Input() operation: Operation;
  public operations: Operation[];
  public operations$: Observable<Operation[]>;
  public filterBy: string = 'operation-name';
  public selectedSortFlag: string = 'desc';

  constructor(private operationService: OperationService) {}
  ngOnInit() {
    this.operations$ = this.operationService.getAllOperations().pipe(
      map((operations: Operation[]) => {
        this.operations = operations;
        return operations;
      })
    );
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
    this.reverse();
  };
  // Per first release, we don't pull in inactive operations
  // sortOperationsByOperationStatus = function(sortFlag: string) {
  //   this.filterBy = 'operation-status';
  //   if (sortFlag == 'asc') {
  //     this.operations.sort((a: Operation, b: Operation) => {
  //       return <any>new Date(a.operationActive) - <any>new Date(b.operationActive);
  //     });
  //   } else {
  //     this.operations.sort((a: Operation, b: Operation) => {
  //       return <any>new Date(b.operationActive) - <any>new Date(a.operationActive);
  //     });
  //   }
  // };
}
