import { Component, Input, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';
import { OperationService } from '../operation.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { Observable } from 'rxjs';
import { Operation } from '../operation';

@Component({
  selector: 'app-operation-admin-right-sidebar',
  templateUrl: './operation-admin-right-sidebar.component.html',
  styleUrls: ['./operation-admin-right-sidebar.component.scss'],
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
export class OperationAdminRightSidebarComponent implements OnInit {
  operation: Operation | null;
  isOpen = true;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  operations: Operation[];
  operationAssignedUsers$: Observable<User[]>;
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    let operationId = this.route.snapshot.data.operation | this.route.snapshot.queryParams.operationId;
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    this.operationAssignedUsers$ = this.operationService.getUsersAssignedByOperationId(operationId);
  }
  public toggleOperationUsersAssignedMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
