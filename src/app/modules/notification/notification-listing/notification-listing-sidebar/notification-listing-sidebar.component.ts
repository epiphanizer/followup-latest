import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';
import { forkJoin } from 'rxjs';

import { User } from '@app/modules/user/user';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';

type FacilityVisibilityFilter = 'active' | 'archived';

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
  ],
  standalone: false
})
export class NotificationListingSidebarComponent implements OnInit, OnChanges {
  @Output() operationChangeEvent = new EventEmitter<Operation>();
  @Input() selectedOperation: Operation | null = null;
  activeOperationId: string;
  facilityFilter: FacilityVisibilityFilter | null = 'active';
  operationGroupsLoaded: boolean = false;
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  operationGroups: OperationGroup[] = null;
  private currentRouteOperationId: string | null = null;

  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  user: User;
  todaysDateDay: string;
  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    this.route.paramMap.subscribe((paramMap: any) => {
      this.currentRouteOperationId = paramMap.get ? paramMap.get('operationId') : paramMap.params?.operationId;
      this.syncSelectedOperationFromRoute();
    });

    this.loadOperationGroups();

    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedOperation &&
      changes.selectedOperation.currentValue &&
      changes.selectedOperation.currentValue.operationId !== this.activeOperationId
    ) {
      this.setActiveOperationInternal(changes.selectedOperation.currentValue, false);
    }
  }

  setActiveOperation = function(operation: Operation) {
    this.setActiveOperationInternal(operation, true);
  };

  get facilityCounts() {
    const operationGroups = this.operationGroups || [];
    const active = operationGroups.filter((operationGroup: OperationGroup) => !this.isArchivedOperationGroup(operationGroup))
      .length;
    const archived = operationGroups.filter((operationGroup: OperationGroup) => this.isArchivedOperationGroup(operationGroup))
      .length;

    return { active, archived };
  }

  get visibleOperationGroups(): OperationGroup[] {
    if (!this.facilityFilter) {
      return [];
    }

    return this.getOperationGroupsForFacilityFilter(this.facilityFilter);
  }

  getOperationGroupsForFacilityFilter(filter: FacilityVisibilityFilter): OperationGroup[] {
    return (this.operationGroups || []).filter((operationGroup: OperationGroup) => {
      const isArchived = this.isArchivedOperationGroup(operationGroup);
      return filter === 'archived' ? isArchived : !isArchived;
    });
  }

  setFacilityFilter(filter: FacilityVisibilityFilter) {
    if (this.facilityFilter === filter) {
      this.facilityFilter = null;
      return;
    }

    this.facilityFilter = filter;

    const selectedOperation = this.selected.operation;
    if (selectedOperation && this.operationMatchesFacilityFilter(selectedOperation, filter)) {
      this.openOperationGroup(selectedOperation.operationGroupId);
      return;
    }

    const fallbackOperation = this.getDefaultOperationForFacilityFilter(filter);
    if (fallbackOperation) {
      this.setActiveOperationInternal(fallbackOperation, true);
    }
  }

  toggleOperationSidebarMenu(operationGroup: OperationGroup) {
    if (!this.operationGroups || !this.operationGroups.length) {
      return;
    }
    this.operationGroups.forEach((group: OperationGroup) => {
      if (group.operationGroupId === operationGroup.operationGroupId) {
        group.sidebarDropdownOpen = !group.sidebarDropdownOpen;
      } else {
        group.sidebarDropdownOpen = false;
      }
    });
  }

  private setActiveOperationInternal(operation: Operation, emitEvent: boolean) {
    if (!operation) {
      return;
    }

    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.syncFacilityFilter(operation.operationGroupId);
    this.openOperationGroup(operation.operationGroupId);

    if (emitEvent) {
      this.operationChangeEvent.emit(operation);
    }
  }

  private getDefaultOperation(): Operation | null {
    let firstAvailableOperation: Operation | null = null;

    for (const operationGroup of this.operationGroups || []) {
      if (!operationGroup.operations || !operationGroup.operations.length) {
        continue;
      }

      if (!firstAvailableOperation) {
        firstAvailableOperation = operationGroup.operations[0];
      }

      const activeOperation = operationGroup.operations.find((operation: Operation) => Number(operation?.operationActive) !== 0);
      if (activeOperation) {
        return activeOperation;
      }
    }

    return firstAvailableOperation;
  }

  private getDefaultOperationForFacilityFilter(filter: FacilityVisibilityFilter): Operation | null {
    let firstVisibleOperation: Operation | null = null;

    for (const operationGroup of this.getOperationGroupsForFacilityFilter(filter)) {
      const operations = Array.isArray(operationGroup?.operations) ? operationGroup.operations : [];
      const visibleOperations = operations.filter((operation: Operation) => this.isOperationVisible(operationGroup, operation));

      if (!visibleOperations.length) {
        continue;
      }

      if (!firstVisibleOperation) {
        firstVisibleOperation = visibleOperations[0];
      }

      const activeOperation = visibleOperations.find((operation: Operation) => Number(operation?.operationActive) !== 0);
      if (activeOperation) {
        return activeOperation;
      }
    }

    return firstVisibleOperation;
  }

  isOperationVisible(operationGroup: OperationGroup, operation: Operation): boolean {
    if (!operation) {
      return false;
    }

    return (
      this.isArchivedOperationGroup(operationGroup) ||
      Number(operation?.operationActive) !== 0 ||
      operation.operationId === this.activeOperationId
    );
  }

  private operationMatchesFacilityFilter(operation: Operation | null | undefined, filter: FacilityVisibilityFilter): boolean {
    if (!operation?.operationGroupId) {
      return false;
    }

    const operationGroup = this.findOperationGroupById(operation.operationGroupId);
    if (!operationGroup) {
      return false;
    }

    const isArchived = this.isArchivedOperationGroup(operationGroup);
    return filter === 'archived' ? isArchived : !isArchived;
  }

  private findOperationById(operationId: string): Operation | null {
    for (const operationGroup of this.operationGroups || []) {
      const operation = (operationGroup.operations || []).find((userOperation: Operation) => {
        return userOperation.operationId === operationId;
      });
      if (operation) {
        return operation;
      }
    }
    return null;
  }

  private findOperationGroupById(operationGroupId: string | null | undefined): OperationGroup | null {
    if (!operationGroupId) {
      return null;
    }

    return (
      (this.operationGroups || []).find(
        (operationGroup: OperationGroup) => operationGroup.operationGroupId === operationGroupId
      ) ||
      null
    );
  }

  private isArchivedOperationGroup(operationGroup: OperationGroup | null | undefined): boolean {
    return Number(operationGroup?.operationGroupActive) === 0;
  }

  private loadOperationGroups() {
    this.operationGroupsLoaded = false;
    const cachedOperationGroups = this.normalizeOperationGroups(this.user?.operationGroups || []);
    const userId = this.user?.userId;

    if (!userId) {
      this.operationGroups = cachedOperationGroups;
      this.operationGroupsLoaded = true;
      this.syncSelectedOperationFromRoute();
      return;
    }

    forkJoin({
      operationGroups: this.operationService.getAllOperationGroups(),
      operations: this.operationService.getOperationsByUserId(userId)
    }).subscribe({
      next: ({ operationGroups, operations }) => {
        const hydratedOperationGroups = this.buildOperationGroupsForUser(operationGroups, operations);
        this.operationGroups = hydratedOperationGroups.length ? hydratedOperationGroups : cachedOperationGroups;
        this.operationGroupsLoaded = true;
        this.syncSelectedOperationFromRoute();
      },
      error: () => {
        this.operationGroups = cachedOperationGroups;
        this.operationGroupsLoaded = true;
        this.syncSelectedOperationFromRoute();
      }
    });
  }

  private buildOperationGroupsForUser(operationGroups: OperationGroup[], operations: Operation[]): OperationGroup[] {
    const operationsByGroupId = new Map<string, Operation[]>();

    (Array.isArray(operations) ? operations : []).forEach((operation: Operation) => {
      if (!operation?.operationGroupId) {
        return;
      }

      const groupOperations = operationsByGroupId.get(operation.operationGroupId) || [];
      groupOperations.push(operation);
      operationsByGroupId.set(operation.operationGroupId, groupOperations);
    });

    const accessibleOperationGroups = (Array.isArray(operationGroups) ? operationGroups : [])
      .map((operationGroup: OperationGroup) => {
        const groupOperations = operationsByGroupId.get(operationGroup.operationGroupId) || [];

        return {
          ...operationGroup,
          operations: groupOperations.sort((a: Operation, b: Operation) => {
            if (a.operationName < b.operationName) {
              return -1;
            }
            if (a.operationName > b.operationName) {
              return 1;
            }
            return 0;
          })
        };
      })
      .filter((operationGroup: OperationGroup) => {
        return Array.isArray(operationGroup.operations) && operationGroup.operations.length > 0;
      });

    return this.normalizeOperationGroups(accessibleOperationGroups);
  }

  private normalizeOperationGroups(operationGroups: OperationGroup[]): OperationGroup[] {
    return operationGroups.map((operationGroup: OperationGroup, idx: number) => {
      return {
        ...operationGroup,
        operationGroupActive: this.isArchivedOperationGroup(operationGroup) ? 0 : 1,
        operations: Array.isArray(operationGroup?.operations) ? operationGroup.operations : [],
        sidebarDropdownOpen: idx === 0
      };
    });
  }

  private syncFacilityFilter(operationGroupId: string | null | undefined) {
    const operationGroup = this.findOperationGroupById(operationGroupId);

    if (!operationGroup) {
      return;
    }

    this.facilityFilter = this.isArchivedOperationGroup(operationGroup) ? 'archived' : 'active';
  }

  private openOperationGroup(operationGroupId: string) {
    if (!this.operationGroups || !this.operationGroups.length) {
      return;
    }
    this.operationGroups.forEach((group: OperationGroup) => {
      group.sidebarDropdownOpen = group.operationGroupId === operationGroupId;
    });
  }

  private syncSelectedOperationFromRoute() {
    if (!this.operationGroups) {
      return;
    }

    const defaultOperation = this.selectedOperation || this.getDefaultOperation();
    const operationId = this.currentRouteOperationId || defaultOperation?.operationId;

    if (!operationId) {
      this.selected.operation = null;
      this.activeOperationId = null;
      return;
    }

    const operationFromGroups = this.findOperationById(operationId);
    if (operationFromGroups) {
      this.setActiveOperationInternal(operationFromGroups, false);
      return;
    }

    this.operationService.getOperationByOperationId(operationId).subscribe((result: Operation | Operation[]) => {
      const resolvedOperation = Array.isArray(result) ? result[0] : result;
      this.setActiveOperationInternal(resolvedOperation, false);
    });
  }

  trackByOperationGroup(index: number, operationGroup: OperationGroup): string | number {
    return operationGroup?.operationGroupId || index;
  }

  trackByOperation(index: number, operation: Operation): string | number {
    return operation?.operationId || index;
  }
}
