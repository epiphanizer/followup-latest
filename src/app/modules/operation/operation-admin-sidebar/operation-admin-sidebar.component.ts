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
  styleUrls: ['./operation-admin-sidebar.component.scss']
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

  operationGroups: OperationGroup[] = [];
  operationGroups$: Observable<OperationGroup[]>;
  operations: Operation[] = [];
  user: User;
  todaysDateDay: number;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  ngOnInit() {
    this.operationGroups$ = this.operationService.getOperationGroups();
    this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
      this.operationGroups = operationGroups;
    });
    this.user = this.route.snapshot.data.user;
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.operationChangeEvent.emit(operation);
  };
}
