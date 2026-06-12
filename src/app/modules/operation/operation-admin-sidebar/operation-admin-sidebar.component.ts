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
  ],
  standalone: false
})
export class OperationAdminSidebarComponent implements OnInit {
  availableOperations$: Observable<Operation[]>;
  activeOperationId: string;
  activeOperationGroupId: string;
  private currentRouteOperationId: string | null = null;
  private currentRouteOperationGroupId: string | null = null;
  clientMode: boolean = false;
  clientFilter: 'active' | 'archived' = 'active';
  isRestoringClient: boolean = false;
  private restoreInFlightByGroupId: { [operationGroupId: string]: boolean } = {};
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
    if (this.clientMode) {
      this.operationGroups.forEach((operationGroup: OperationGroup) => {
        operationGroup.sidebarDropdownOpen = false;
      });
      return;
    }

    this.operationGroups.forEach((operationGroup: OperationGroup) => {
      operationGroup.sidebarDropdownOpen = !!operationGroupId && operationGroup.operationGroupId == operationGroupId;
    });
  }

  private normalizeOperationGroup(operationGroup: OperationGroup): OperationGroup {
    const isActive = Number(operationGroup?.operationGroupActive) === 0 ? 0 : 1;

    return {
      ...operationGroup,
      operationGroupActive: isActive,
      operations: Array.isArray(operationGroup?.operations) ? operationGroup.operations : [],
      sidebarDropdownOpen: !!operationGroup?.sidebarDropdownOpen
    };
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

    if (this.clientMode && this.selected.operationGroup) {
      const selectedIsArchived = this.selected.operationGroup.operationGroupActive === 0;
      const selectedVisibleInCurrentFilter =
        (this.clientFilter === 'archived' && selectedIsArchived) ||
        (this.clientFilter === 'active' && !selectedIsArchived);

      if (!selectedVisibleInCurrentFilter) {
        this.clientFilter = selectedIsArchived ? 'archived' : 'active';
      }
    }

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

      return this.normalizeOperationGroup({
        ...operationGroup,
        operations,
        operationGroupActive: Number(operationGroup?.operationGroupActive) === 0 ? 0 : 1,
        sidebarDropdownOpen: !!operationGroup.sidebarDropdownOpen
      });
    });
  }

  private loadOperationGroupsForClients() {
    this.operationService.getAllOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
      const safeOperationGroups = Array.isArray(operationGroups) ? operationGroups : [];
      this.operationGroups = safeOperationGroups.map((operationGroup: OperationGroup) =>
        this.normalizeOperationGroup(operationGroup)
      );
      this.syncSelectionFromRoute();
      this._cdr.detectChanges();
    });
  }

  private loadOperationGroupsForOperations(userOperationGroups: OperationGroup[]) {
    if (!localStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        const safeOperationGroups = Array.isArray(operationGroups) ? operationGroups : [];

        if (!safeOperationGroups.length) {
          this.operationGroups = userOperationGroups;
          this.syncSelectionFromRoute();
          return;
        }

        operationGroups.forEach((operationGroup: OperationGroup) => {
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
        this.operationGroups = safeOperationGroups.map((operationGroup: OperationGroup) =>
          this.normalizeOperationGroup(operationGroup)
        );
        this.syncSelectionFromRoute();
      });
      return;
    }

    this.operationGroups = userOperationGroups;
    this.syncSelectionFromRoute();
  }

  get clientCounts() {
    const active = this.operationGroups.filter((operationGroup: OperationGroup) => operationGroup.operationGroupActive !== 0)
      .length;
    const archived = this.operationGroups.filter((operationGroup: OperationGroup) => operationGroup.operationGroupActive === 0)
      .length;

    return { active, archived };
  }

  get visibleOperationGroups(): OperationGroup[] {
    if (!this.clientMode) {
      return this.operationGroups;
    }

    return this.operationGroups.filter((operationGroup: OperationGroup) => {
      const isArchived = operationGroup.operationGroupActive === 0;
      return this.clientFilter === 'archived' ? isArchived : !isArchived;
    });
  }

  setClientFilter(nextFilter: 'active' | 'archived') {
    if (this.clientFilter === nextFilter) {
      return;
    }

    this.clientFilter = nextFilter;

    if (!this.selected.operationGroup) {
      return;
    }

    const selectedIsArchived = this.selected.operationGroup.operationGroupActive === 0;
    if ((nextFilter === 'archived' && !selectedIsArchived) || (nextFilter === 'active' && selectedIsArchived)) {
      const fallbackOperationGroup = this.visibleOperationGroups[0] || null;
      if (!fallbackOperationGroup) {
        this.selected.operationGroup = null;
        this.activeOperationGroupId = null;
        return;
      }
      this.setActiveOperationGroup(fallbackOperationGroup);
    }
  }

  isClientRestoreInFlight(operationGroup: OperationGroup): boolean {
    const operationGroupId = operationGroup?.operationGroupId;
    return !!operationGroupId && !!this.restoreInFlightByGroupId[operationGroupId];
  }

  restoreClient(operationGroup: OperationGroup, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!operationGroup?.operationGroupId || this.isClientRestoreInFlight(operationGroup)) {
      return;
    }

    const shouldRestore = window.confirm('Restore this archived client?');
    if (!shouldRestore) {
      return;
    }

    const operationGroupId = operationGroup.operationGroupId;
    this.restoreInFlightByGroupId[operationGroupId] = true;
    this.isRestoringClient = true;

    this.operationService.restoreOperationGroupByOperationGroupId(operationGroupId).subscribe(
      () => {
        this.restoreInFlightByGroupId[operationGroupId] = false;
        this.isRestoringClient = Object.values(this.restoreInFlightByGroupId).some((inFlight: boolean) => inFlight);
        operationGroup.operationGroupActive = 1;

        if (this.clientFilter === 'archived') {
          const nextArchived = this.visibleOperationGroups[0] || null;
          if (nextArchived) {
            this.setActiveOperationGroup(nextArchived);
          } else {
            this.selected.operationGroup = null;
            this.activeOperationGroupId = null;
          }
        }

        this._cdr.detectChanges();
      },
      () => {
        this.restoreInFlightByGroupId[operationGroupId] = false;
        this.isRestoringClient = Object.values(this.restoreInFlightByGroupId).some((inFlight: boolean) => inFlight);
      }
    );
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user || ({} as User);
    this.clientMode = this.route.snapshot.data.section === 'clients';
    this.groupNavigationLabel = this.clientMode ? 'CLIENTS' : 'FACILITIES';
    const userOperationGroups = this.getUserOperationGroups();

    if (this.clientMode) {
      this.loadOperationGroupsForClients();
    } else {
      this.loadOperationGroupsForOperations(userOperationGroups);
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
    if (!operationGroup?.operationGroupId) {
      return;
    }

    if (this.activeOperationGroupId === operationGroup.operationGroupId) {
      return;
    }

    this.selected.operation = null;
    this.activeOperationId = null;
    operationGroup.sidebarDropdownOpen = true;
    this.selected.operationGroup = operationGroup;
    this.activeOperationGroupId = operationGroup.operationGroupId;
    this.openOnlyOperationGroup(this.activeOperationGroupId);
    this.operationGroupChangeEvent.emit(this.activeOperationGroupId);
  }

  handleOperationGroupClick(operationGroup: OperationGroup, event?: Event) {
    if (!operationGroup?.operationGroupId) {
      return;
    }

    if (this.clientMode) {
      this.setActiveOperationGroup(operationGroup);
      return;
    }

    if (this.activeOperationGroupId === operationGroup.operationGroupId) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      this.toggleOperationSidebarMenu(operationGroup);
      return;
    }

    this.setActiveOperationGroup(operationGroup);
  }

  toggleOperationSidebarMenu(operationGroup: OperationGroup, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

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
