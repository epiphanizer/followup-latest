import { Component, OnInit, Output } from '@angular/core';
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
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  ngOnInit() {
    // we only want to default if the operation id is not passed
    this.route.paramMap.subscribe((data: any) => {
      if (this.route.snapshot.data.mode == 'spanish') {
        this.mode.spanish = true;
      } else {
        if (data.params.operationId) {
          this.operationService.getOperationByOperationId(data.params.operationId).subscribe((data: Operation) => {
            this.selected.operation = data[0];
          });
        } else {
          this.user = this.route.snapshot.data.user;
          console.log(this.user);
          this.selected.operation = this.user.operationGroups[0].operations[0];
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
  }
}
