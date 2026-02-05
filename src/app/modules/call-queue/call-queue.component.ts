import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { User } from '@app/modules/user/user';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Operation } from '../operation/operation';
import { OperationService } from '../operation/operation.service';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  activeOperationId: number;
  mode: any = {
    spanish: false
  };
  public selected:
    | {
        filterDate: string;
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(
    private route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private operationService: OperationService
  ) {}
  ngOnInit() {
    // we only want to default if the operation id is not passed
    this.route.paramMap.subscribe((data: any) => {
      if (this.route.snapshot.data.mode == 'spanish') {
        this.mode.spanish = true;
      } else {
        if (data.params.operationId) {
          this.operationService
            .getOperationByOperationId(data.params.operationId)
            .subscribe((operationResult: Operation | Operation[]) => {
              const operation = Array.isArray(operationResult) ? operationResult[0] : operationResult;
              if (operation) {
                this.selected.operation = operation;
              }
            });
        } else {
          this.user = this.route.snapshot.data.user;
          let firstGroup = this.user.operationGroups[0];
          let firstOperation = this.user.operations.find(
            (operation: Operation) => operation.operationGroupId == firstGroup.operationGroupId
          );
          this.operationService
            .getOperationByOperationId(firstOperation.operationId)
            .subscribe((operationResult: Operation | Operation[]) => {
              const operation = Array.isArray(operationResult) ? operationResult[0] : operationResult;
              if (operation) {
                this.selected.operation = operation;
                this.selected.operation.operationGroupShortName = this.user.operationGroups[0].operationGroupShortName;
              }
            });
        }
      }
    });
  }

  handleDateFilterChangeEvent($event: string) {
    this.selected.filterDate = $event;
  }
  operationChangeEventHandler($event: Operation) {
    this.mode.spanish = false;
    this.selected.operation = $event;
    this._cdr.detectChanges();
  }
}
