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
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OperationService } from '@app/modules/operation/operation.service';
import { map } from 'rxjs/operators';

@Component({
  providers: [OperationService],
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
  @Output() operationChangeEvent = new EventEmitter<string>();
  activeOperationId: string;
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  operationGroups: OperationGroup[] = null;
  operationGroups$: Observable<OperationGroup[]>;

  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  operations: Operation[];
  user: User;
  todaysDateDay: string;
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (!localStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
          operationGroup.operations$ = this.operationService
            .getActiveOperationsByOperationGroupId(operationGroup, this.user)
            .pipe(
              map((operations: Operation[]) => {
                if (operations) {
                  if (idx == 0 && !this.selected.operation) {
                    this.selected.operation = operations[0];
                    this.activeOperationId = this.selected.operation.operationId;
                  }
                  return operations;
                }
              })
            );
          if (idx == 0) {
            operationGroup.sidebarDropdownOpen = true;
          } else {
            operationGroup.sidebarDropdownOpen = false;
          }
        });
        this.operationGroups = operationGroups;
      });
    } else {
      this.operationGroups = this.user.operationGroups;
    }

    this.route.paramMap.subscribe((data: any) => {
      const operationId = data.get ? data.get('operationId') : data.params?.operationId;

      if (operationId) {
        this.operationService.getOperationByOperationId(operationId).subscribe((result: Operation | Operation[]) => {
          const resolvedOperation = Array.isArray(result) ? result[0] : result;
          if (resolvedOperation) {
            this.selected.operation = resolvedOperation;
            this.activeOperationId = this.selected.operation.operationId;
          }
        });
        return;
      }

      if (this.user?.operations?.length) {
        this.operations = this.user.operationGroups?.[0]?.operations || [];
      }
    });

    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;

    this.activeOperationId = this.selected.operation.operationId;
    this.operationChangeEvent.emit(operation);
    if (this.operationGroups) {
      this.operationGroups.forEach((operationGroup: OperationGroup) => {
        if (this.selected.operation.operationGroupId != operationGroup.operationGroupId) {
          operationGroup.sidebarDropdownOpen = false;
        }
      });
    }
  };
  toggleOperationSidebarMenu(operationGroup: OperationGroup) {
    operationGroup.sidebarDropdownOpen = !operationGroup.sidebarDropdownOpen;
  }
}
