import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import { User } from '@app/modules/user/user';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Operation, OperationGroup } from '../operation/operation';
import { OperationService } from '../operation/operation.service';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss'],
  standalone: false
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

  private resolveOperationFromUserContext(operationId?: string): Operation | null {
    const operations = this.user?.operations || [];
    if (!operations.length) {
      return null;
    }

    let operation: Operation;
    if (operationId) {
      operation = operations.find((candidate: Operation) => String(candidate?.operationId) === String(operationId));
    } else {
      const firstGroup = this.user?.operationGroups?.[0];
      if (!firstGroup) {
        return null;
      }

      operation =
        firstGroup.operations?.[0] ||
        operations.find((candidate: Operation) => String(candidate?.operationGroupId) === String(firstGroup.operationGroupId));
    }

    if (!operation) {
      return null;
    }

    const operationGroup = this.user?.operationGroups?.find(
      (group: OperationGroup) => String(group?.operationGroupId) === String(operation.operationGroupId)
    );

    return {
      ...operation,
      operationGroupName: operation.operationGroupName || operationGroup?.operationGroupName,
      operationGroupShortName: operation.operationGroupShortName || operationGroup?.operationGroupShortName
    };
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    // we only want to default if the operation id is not passed
    this.route.paramMap.subscribe((data: any) => {
      if (this.route.snapshot.data.mode == 'spanish') {
        this.mode.spanish = true;
      } else {
        const selectedOperation = this.resolveOperationFromUserContext(data.params.operationId);
        if (selectedOperation) {
          this.selected.operation = selectedOperation;
          return;
        }

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
          if (!this.user || !this.user.operationGroups?.length || !this.user.operations?.length) {
            this.selected.operation = null;
            return;
          }
          this.selected.operation = null;
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
