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
  private currentRouteOperationId: string | null = null;
  private currentRouteOperationGroupId: string | null = null;
  clientMode: boolean = false;
  groupNavigationLabel: string = 'FACILITIES';
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

  private getOperationFromResult(result: Operation | Operation[]): Operation | null {
    if (Array.isArray(result)) {
      return result.length ? result[0] : null;
    }

    return result || null;
  }

  private openOnlyOperationGroup(operationGroupId: string | null | undefined) {
    this.operationGroups.forEach((operationGroup: OperationGroup) => {
      operationGroup.sidebarDropdownOpen = !!operationGroupId && operationGroup.operationGroupId == operationGroupId;
    });
  }

  private syncOperationGroupSelection(operationGroupId: string | null | undefined) {
    if (!operationGroupId) {
      this.selected.operationGroup = this.operationGroups.length ? this.operationGroups[0] : null;
      this.activeOperationGroupId = this.selected.operationGroup?.operationGroupId || null;
      this.openOnlyOperationGroup(this.activeOperationGroupId);
      return;
    }

    const matchedOperationGroup =
      this.operationGroups.find(
        (operationGroup: OperationGroup) => operationGroup.operationGroupId == operationGroupId
      ) || null;

    this.selected.operationGroup =
      matchedOperationGroup ||
      ({
        operationGroupId,
        operationGroupName: '',
        operationGroupShortName: '',
        operations: []
      } as OperationGroup);
    this.activeOperationGroupId = operationGroupId;
    this.openOnlyOperationGroup(operationGroupId);
  }

  private syncSelectionFromRoute() {
    if (this.currentRouteOperationId) {
      this.operationService
        .getOperationByOperationId(this.currentRouteOperationId)
        .subscribe((data: Operation | Operation[]) => {
          const operation = this.getOperationFromResult(data);

          if (!operation) {
            return;
          }

          this.selected.operation = operation;
          this.activeOperationId = operation.operationId;
          this.syncOperationGroupSelection(operation.operationGroupId);
        });
      return;
    }

    if (this.currentRouteOperationGroupId) {
      this.selected.operation = null;
      this.activeOperationId = null;
      this.syncOperationGroupSelection(this.currentRouteOperationGroupId);
      return;
    }

    this.selected.operation = null;
    this.activeOperationId = null;
    this.syncOperationGroupSelection(this.operationGroups[0]?.operationGroupId || null);
  }

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
    this.clientMode = this.route.snapshot.data.section === 'clients';
    this.groupNavigationLabel = this.clientMode ? 'CLIENTS' : 'FACILITIES';
    const userOperationGroups = this.getUserOperationGroups();

    if (!localStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        const safeOperationGroups = Array.isArray(operationGroups) ? operationGroups : [];

        if (!safeOperationGroups.length) {
          this.operationGroups = userOperationGroups;
          this.syncSelectionFromRoute();
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

                return safeOperations;
              })
            );
          operationGroup.sidebarDropdownOpen = false;
        });
        this.operationGroups = safeOperationGroups;
        this.syncSelectionFromRoute();
      });
    } else {
      this.operationGroups = userOperationGroups;
      this.syncSelectionFromRoute();
    }

    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.route.paramMap.subscribe((data: any) => {
      this.currentRouteOperationId = data.get ? data.get('operationId') : data.params?.operationId || null;
      this.currentRouteOperationGroupId = data.get
        ? data.get('operationGroupId')
        : data.params?.operationGroupId || null;
      this.syncSelectionFromRoute();
      this.operations = this.selected.operationGroup?.operations || [];
    });
  }

  setActiveOperation(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.syncOperationGroupSelection(operation.operationGroupId || this.activeOperationGroupId);
    this.operationChangeEvent.emit(this.activeOperationId);
  }

  setActiveOperationGroup(operationGroup: OperationGroup) {
    this.selected.operation = null;
    this.activeOperationId = null;
    operationGroup.sidebarDropdownOpen = true;
    this.selected.operationGroup = operationGroup;
    this.activeOperationGroupId = operationGroup.operationGroupId;
    this.openOnlyOperationGroup(this.activeOperationGroupId);
    this.operationGroupChangeEvent.emit(this.activeOperationGroupId);
  }

  toggleOperationSidebarMenu(operationGroup: OperationGroup) {
    if (!this.isTouched) this.isTouched = true;

    if (operationGroup.sidebarDropdownOpen) {
      operationGroup.sidebarDropdownOpen = false;
      return;
    }

    operationGroup.sidebarDropdownOpen = true;
    this.openOnlyOperationGroup(operationGroup.operationGroupId);
  }

  isOperationGroupActive(operationGroup: OperationGroup): boolean {
    return operationGroup?.operationGroupId == this.activeOperationGroupId;
  }

  isOperationGroupExpanded(operationGroup: OperationGroup): boolean {
    return !!operationGroup?.sidebarDropdownOpen;
  }

  getOperationGroupRoute(operationGroup: OperationGroup): any[] {
    return this.clientMode
      ? ['/clients', operationGroup.operationGroupId]
      : ['/operations/group', operationGroup.operationGroupId];
  }

  trackByOperationGroup(index: number, operationGroup: OperationGroup): string | number {
    return operationGroup?.operationGroupId || index;
  }

  trackByOperation(index: number, operation: Operation): string | number {
    return operation?.operationId || index;
  }
}
