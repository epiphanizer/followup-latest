import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
import { map } from 'rxjs/operators';

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
  activeOperationId: string;
  editMode: boolean;
  @Output() operationChangeEvent = new EventEmitter<string>();
  @Output() operationGroupChangeEvent = new EventEmitter<string>();
  selected: {
    operation?: Operation | null;
  } = {
    operation: null
  };
  isTouched: boolean = false;
  operationGroups: OperationGroup[] = [];
  operationGroups$: Observable<OperationGroup[]>;
  operations: Operation[] = [];
  user: User;
  todaysDateDay: string;
  constructor(
    private route: ActivatedRoute,
    private operationService: OperationService,
    private _cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (!localStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        console.log(operationGroups);
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
          /**
           * Busted logic
           */
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
      if (!this.route.snapshot.data.operation) {
        this.operationGroups[0].sidebarDropdownOpen = true;
      } else {
        this.operationService
          .getOperationByOperationId(this.route.snapshot.data.operation.operationId)
          .subscribe((data: Operation | Operation[]) => {
            const operation = Array.isArray(data) ? data[0] : data;
            if (operation) {
              this.selected.operation = operation;
              this.activeOperationId = this.selected.operation.operationId;
            }
          });
        // do nothing
      }
      // this._cdr.detectChanges();
    }

    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.route.paramMap.subscribe((data: any) => {
      var operationId;
      if (data.params.operation) {
        operationId = data.params.operation.operationId;
      } else {
        operationId = this.user.operations[0].operationId;
        this.operations = this.user.operationGroups[0].operations;
      }
      if (data.params.operation) {
        this.operationService
          .getOperationByOperationId(data.params.operation.operationId)
          .subscribe((data: Operation | Operation[]) => {
            const operation = Array.isArray(data) ? data[0] : data;
            if (operation) {
              this.selected.operation = operation;
              this.activeOperationId = this.selected.operation.operationId;
            }
          });
      }
    });
  }

  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.operationChangeEvent.emit(this.activeOperationId);
  };
  setActiveOperationGroup = function(operationGroup: OperationGroup) {
    operationGroup.sidebarDropdownOpen = true;
    /**
     * Reassign selected group
     */
    this.selected.operationGroup = operationGroup;
    this.activeOperationGroupId = operationGroup.operationGroupId;
    this.operationGroupChangeEvent.emit(this.activeOperationGroupId);
  };
  toggleOperationSidebarMenu(operationGroup: OperationGroup) {
    if (!this.isTouched) this.isTouched = true;
    operationGroup.sidebarDropdownOpen = !operationGroup.sidebarDropdownOpen;
  }
}
