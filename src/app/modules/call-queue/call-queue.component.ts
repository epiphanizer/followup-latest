import { Component, OnInit, Output } from '@angular/core';
import { User } from '@app/modules/user/user';
import { Observable, from } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Operation } from '../operation/operation';

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
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.user.operations$.subscribe((data: Operation[]) => {
      /** Init to the first assigned operation alphabetically */
      this.selected.operation = data[0];
    });
  }
  ngOnChanges() {}

  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
  }
}
