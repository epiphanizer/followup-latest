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
  activeOperationGroupId: string;
  editMode: boolean;
  @Output() operationChangeEvent = new EventEmitter<string>();
  @Output() operationGroupChangeEvent = new EventEmitter<string>();
  selected: {
    operation?: Operation | null;
    operationGroup?: OperationGroup | null;
  } = {
    operation: null,
    operationGroup: null
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

  private getUserOperationGroups(): OperationGroup[] {
    const userGroups: OperationGroup[] = Array.isArray(this.user?.operationGroups) ? this.user.operationGroups : [];
    const userOperations: Operation[] = Array.isArray(this.user?.operations) ? this.user.operations : [];

    return userGroups.map((operationGroup: OperationGroup) => {
      const operations = Array.isArray(operationGroup.operations)
        ? operationGroup.operations
        : userOperations.filter(
            (operation: Operation) => operation.operationGroupId == operationGroup.operationGroupId
          );

      return {
        ...operationGroup,
        operations,
        sidebarDropdownOpen: !!operationGroup.sidebarDropdownOpen
      };
    });
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user || ({} as User);
    const userOperationGroups = this.getUserOperationGroups();

    if (!localStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        const safeOperationGroups = Array.isArray(operationGroups) ? operationGroups : [];

        if (!safeOperationGroups.length) {
          this.operationGroups = userOperationGroups;
          return;
        }

        operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
          operationGroup.operations = [];
          operationGroup.operations$ = this.operationService
            .getActiveOperationsByOperationGroupId(operationGroup, this.user)
            .pipe(
              map((operations: Operation[]) => {
                const safeOperations = Array.isArray(operations) ? operations : [];
                operationGroup.operations = safeOperations;

                if (safeOperations.length) {
                  if (idx == 0 && !this.selected.operation) {
                    this.selected.operation = safeOperations[0];
                    this.activeOperationId = this.selected.operation.operationId;
                  }
                }

                return safeOperations;
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
        this.operationGroups = safeOperationGroups;
      });
    } else {
      this.operationGroups = userOperationGroups;
      if (!this.route.snapshot.data.operation) {
        if (this.operationGroups.length) {
          this.operationGroups[0].sidebarDropdownOpen = true;
        }
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
      const operationId = data.get ? data.get('operationId') : data.params?.operationId;

      if (operationId) {
        this.operationService.getOperationByOperationId(operationId).subscribe((result: Operation | Operation[]) => {
          const operation = Array.isArray(result) ? result[0] : result;
          if (operation) {
            this.selected.operation = operation;
            this.activeOperationId = this.selected.operation.operationId;
          }
        });
        return;
      }

      if (this.operationGroups.length) {
        this.operations = this.operationGroups[0]?.operations || [];
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

  trackByOperationGroup(index: number, operationGroup: OperationGroup): string | number {
    return operationGroup?.operationGroupId || index;
  }

  trackByOperation(index: number, operation: Operation): string | number {
    return operation?.operationId || index;
  }
}
