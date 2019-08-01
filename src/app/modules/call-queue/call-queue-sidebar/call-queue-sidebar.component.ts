import { Component, Input, OnInit } from '@angular/core';
import { Observable, throwError, Subscription } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Operation } from '@app/modules/operation/operation.service';
import { formatDate } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';

import { User, UserService } from '@app/modules/user/user.service';

import { AuthenticationService } from '@app/core';

@Component({
  providers: [AuthenticationService, UserService],
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
    ]),
    trigger('turnArrow', [
      state(
        'open',
        style({
          transform: 'rotate(0deg)'
        })
      ),
      state(
        'closed',
        style({
          transform: 'rotate(-90deg)'
        })
      ),
      transition('open => closed', [animate('0.125s')]),
      transition('closed => open', [animate('0.125s')])
    ])
  ]
})
export class CallQueueSidebarComponent implements OnInit {
  isOpen = true;
  constructor(private authService: AuthenticationService) {}
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.authService.getUser().then((result: any) => {
      this.user = this.authService.user;
    });
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }

  public switchCallQueueOperationView = function(operationId: number) {
    this.operation = operationId;
  };

  public toggleOperationSidebarMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
