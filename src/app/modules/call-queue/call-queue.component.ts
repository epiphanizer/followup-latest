import { Component, OnInit, Input, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { User } from '@app/modules/user/user.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationService, Operation } from '../operation/operation.service';
import { ActivatedRoute } from '@angular/router';
import { CallQueueSidebarComponent } from './call-queue-sidebar/call-queue-sidebar.component';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  @ViewChild(CallQueueSidebarComponent)
  callQueueSidebar: CallQueueSidebarComponent;
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
    this.selected.operation = this.user.operations[0];
  }
  ngOnChanges() {}

  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
  }
}
