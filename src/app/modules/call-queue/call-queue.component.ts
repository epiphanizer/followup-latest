import { Component, OnInit, Output } from '@angular/core';
import { User } from '@app/modules/user/user';
import { Observable, from } from 'rxjs';
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
  public selected:
    | {
        filterDate: string;
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  ngOnInit() {
    // we only want to default if the operation id is not passed
    this.route.paramMap.subscribe((data: any) => {
      if (data.params.operationId) {
        this.operationService.getOperationByOperationId(data.params.operationId).subscribe((data: Operation) => {
          this.selected.operation = data[0];
        });
      } else {
        this.user = this.route.snapshot.data.user;
        this.user.operations$.subscribe((data: Operation[]) => {
          /** Init to the first assigned operation alphabetically */
          this.selected.operation = data[0];
        });
      }
    });
  }

  handleDateFilterChangeEvent($event: string) {
    this.selected.filterDate = $event;
  }
  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
  }
}
