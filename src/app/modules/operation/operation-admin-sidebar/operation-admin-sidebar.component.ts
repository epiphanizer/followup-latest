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
import { Operation, OperationService } from '../operation.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs-compat/operator/map';

@Component({
  selector: 'app-operation-admin-sidebar',
  templateUrl: './operation-admin-sidebar.component.html',
  styleUrls: ['./operation-admin-sidebar.component.scss'],
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
export class OperationAdminSidebarComponent implements OnInit {
  availableOperations$: Observable<Operation[]>;
  @Output() operationChangeEvent = new EventEmitter<number>();
  selected: {
    operation?: Operation | null;
  } = {
    operation: null
  };
  isOpen = true;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  operations: Operation[] = [];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.operationService.getAllOperations().subscribe((data: Operation[]) => {
      this.operations = data;
      this.selected.operation = this.operations[0];
    });
    this.user = this.route.snapshot.data.user;
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
