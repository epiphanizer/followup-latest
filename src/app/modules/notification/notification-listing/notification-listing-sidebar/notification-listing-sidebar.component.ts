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
  @Output() operationChangeEvent = new EventEmitter<number>();
  activeOperationId: number;
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
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.activeOperationId = parseInt(params.get('operationId'));
        this.operationService.getOperationByOperationId(this.activeOperationId).subscribe((operation: Operation) => {
          this.selected.operation = operation[0];
          if (this.operationGroups) {
            this.operationGroups.forEach(operationGroup => {
              if (this.selected.operation.operationGroupId != operationGroup.operationGroupId) {
                operationGroup.sidebarDropdownOpen = false;
              }
            });
          }
        });
      }
    });
    this.operationGroups$ = this.operationService.getOperationGroups();
    this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
      if (operationGroups) {
        operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
          operationGroup.operations$ = this.operationService
            .getActiveOperationsByOperationGroupId(operationGroup, this.user)
            .pipe(
              map((operations: any) => {
                if (idx == 0) {
                  if (!this.activeOperationId) {
                    this.selected.operation = operations[0];
                    this.activeOperationId = operations[0].operationId;
                  }
                }
                return operations;
              })
            );
          if (idx == 0 && !this.selected.operation) {
            operationGroup.sidebarDropdownOpen = true;
          } else {
            operationGroup.sidebarDropdownOpen = false;
          }
        });
        this.operationGroups = operationGroups;
      }
    });

    this.user = this.route.snapshot.data.user;
    if (this.user.operations$) {
      this.user.operations$.subscribe((data: Operation[]) => {
        /** Init to the first assigned operation alphabetically */
        this.selected.operation = data[0];
        this.operations = data;
        if (this.route.snapshot.data.operation) {
          this.selected.operation = this.route.snapshot.data.operation;
          this.setActiveOperation(this.selected.operation);
        }
      });
    }
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
