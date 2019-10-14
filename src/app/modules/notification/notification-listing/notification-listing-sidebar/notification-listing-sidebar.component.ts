import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';

import { User } from '@app/modules/user/user';
import { Operation } from '@app/modules/operation/operation';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notification-listing-sidebar',
  templateUrl: './notification-listing-sidebar.component.html',
  styleUrls: ['./notification-listing-sidebar.component.scss'],
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
export class NotificationListingSidebarComponent implements OnInit {
  @Output() operationChangeEvent = new EventEmitter<number>();
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  isOpen = true;
  constructor(private route: ActivatedRoute) {}
  operations: Operation[];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.user.operations$.subscribe((data: Operation[]) => {
      /** Init to the first assigned operation alphabetically */
      this.selected.operation = data[0];
      this.operations = data;
    });
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.operationChangeEvent.emit(operation);
  };
  public toggleOperationSidebarMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
