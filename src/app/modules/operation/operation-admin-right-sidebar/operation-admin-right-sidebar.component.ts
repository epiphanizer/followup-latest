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
import { Operation, OperationManager } from '../operation';
import { take, map } from 'rxjs/operators';

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
  @Input() mode: any;

  activeOperationId: number;
  operation: Operation | null;
  isOpen: boolean = true;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  operations: Operation[];
  operationAssignedUsers: any[];
  operationAssignedManagers: OperationManager[];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    if (this.route.snapshot.paramMap.get('operationId')) {
      this.activeOperationId = parseInt(this.route.snapshot.paramMap.get('operationId'));
      this.updateAssignedUsers();
    }
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.operationAssignedUsers = [];
        this.activeOperationId = parseInt(params.get('operationId'));
        this.updateAssignedUsers();
        this.updateAssignedManagers();
      }
    });
  }
  updateAssignedUsers() {
    this.operationService
      .getUsersAssignedByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((users: User[]) => {
          if (users) {
            this.operationAssignedUsers = users;
          } else {
            for (var i = 0; i < 3; i++) {
              this.operationAssignedUsers.push({});
            }
          }
        })
      )
      .subscribe();
  }
  updateAssignedManagers() {
    this.operationService
      .getOperationManagersByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((managers: OperationManager[]) => {
          this.operationAssignedManagers = managers;
        })
      )
      .subscribe();
  }
  public toggleOperationUsersAssignedMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
