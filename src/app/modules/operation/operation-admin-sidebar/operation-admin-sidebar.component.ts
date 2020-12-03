import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
import { Operation, OperationGroup } from '../operation';

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
  activeOperationId: number;
  editMode: boolean;
  @Output() operationChangeEvent = new EventEmitter<number>();
  selected: {
    operation?: Operation | null;
  } = {
    operation: null
  };
  isOpen = true;
  operationGroups: OperationGroup[] = [];
  operations: Operation[] = [];
  user: User;
  todaysDateDay: number;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  ngOnInit() {
    this.operationService.getAllOperations().subscribe((data: Operation[]) => {
      this.operations = data;
      if (!this.route.snapshot.paramMap.get('operationId')) {
        this.editMode = false;
      } else {
        this.editMode = true;
        this.activeOperationId = parseInt(this.route.snapshot.paramMap.get('operationId'));
      }
    });
    this.user = this.route.snapshot.data.user;
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.operationChangeEvent.emit(operation);
  };
  public toggleOperationSidebarMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
