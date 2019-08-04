import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationService, Operation } from '../operation/operation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    let operationId = null;
    if (!this.route.snapshot.data.operationId) {
      operationId = this.user.operations[0].operationId;
    } else {
      operationId = this.route.snapshot.data.operationId;
    }

    this.selected.operation$ = this.operationService.getOperationByOperationId(operationId);
  }
  ngOnChanges() {}
}
