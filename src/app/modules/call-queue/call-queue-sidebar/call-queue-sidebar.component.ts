import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Operation, OperationService } from '@app/shared/operation.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';

@Component({
  providers: [OperationService],
  selector: 'app-call-queue-sidebar',
  templateUrl: './call-queue-sidebar.component.html',
  styleUrls: ['./call-queue-sidebar.component.scss'],
  animations: [
    trigger('expandSidebar', [
      state(
        'open',
        style({
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          opacity: 0
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.25s')])
    ])
  ]
})
export class CallQueueSidebarComponent implements OnInit {
  isOpen = true;
  public operations$: Observable<Operation> | null;
  constructor() {}

  ngOnInit() {}

  public switchCallQueueOperationView = function(operationId: number) {};

  public toggleOperationSidebarMenu = function() {
    this.isOpen = !this.isOpen;
    console.log('toggling operation sidebar');
  };
}
