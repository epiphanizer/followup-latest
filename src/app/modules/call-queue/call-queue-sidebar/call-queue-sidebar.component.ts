import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Operation, OperationService } from '@app/shared/operation.service';

@Component({
  providers: [OperationService],
  selector: 'app-call-queue-sidebar',
  templateUrl: './call-queue-sidebar.component.html',
  styleUrls: ['./call-queue-sidebar.component.scss']
})
export class CallQueueSidebarComponent implements OnInit {
  public operations$: Observable<Operation> | null;
  constructor() {}

  ngOnInit() {}

  public switchCallQueueOperationView = function(operationId: number) {};

  public toggleOperationSidebarMenu = function() {};
}
