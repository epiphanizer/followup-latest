import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { User, UserRolesMap } from '@app/modules/user/user';
import { OperationService } from '@app/modules/operation/operation.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-operation-listing',
  templateUrl: './operation-listing.component.html',
  styleUrls: ['./operation-listing.component.scss'],
  standalone: false
})
export class OperationListingComponent implements OnInit {
  public operationGroups: OperationGroup[];
  public operationGroups$: Observable<OperationGroup[]>;
  public pageTitle = 'Operations';
  public clientMode = false;
  public isRestoringClient = false;

  @Input() operationGroup: OperationGroup;

  public operations: Operation[];
  public operations$: Observable<[Operation]> | void = null;
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  private lastHydratedOperationGroupId: string | null = null;
  private latestHydrationRequestId = 0;
  private hydrationInFlightByGroupId: { [operationGroupId: string]: boolean } = {};
  user: User;
  constructor(
    private _cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private operationService: OperationService
  ) {}

  get selectedGroupName(): string {
    return (
      this.selected?.operationGroup?.operationGroupName ||
      this.selected?.operationGroup?.operationGroupShortName ||
      'Client'
    );
  }

  get selectedGroupShortName(): string {
    return this.selected?.operationGroup?.operationGroupShortName || '';
  }

  get selectedGroupOperationsCount(): number {
    return Array.isArray(this.selected?.operationGroup?.operations)
      ? this.selected.operationGroup.operations.length
      : 0;
  }

  get selectedGroupIsArchived(): boolean {
    return Number(this.selected?.operationGroup?.operationGroupActive) === 0;
  }

  get canEditClient(): boolean {
    return (
      this.clientMode && this.getUserRoleValue(this.user) === 1 && !!this.selected?.operationGroup?.operationGroupId
    );
  }

  get clientEditLink(): any[] {
    return ['/clients', this.selected?.operationGroup?.operationGroupId, 'edit'];
  }

  private hydrateSelectedGroupById(operationGroupId: string) {
    if (!operationGroupId || !this.user?.userId) {
      return;
    }

    if (this.clientMode && this.lastHydratedOperationGroupId === operationGroupId) {
      return;
    }

    if (this.hydrationInFlightByGroupId[operationGroupId]) {
      return;
    }

    const requestId = ++this.latestHydrationRequestId;
    this.hydrationInFlightByGroupId[operationGroupId] = true;

    const operationRequest$ = this.clientMode
      ? this.operationService.getOperationsByOperationGroupId({ operationGroupId } as OperationGroup)
      : this.operationService.getActiveOperationsByOperationGroupId({ operationGroupId } as OperationGroup, this.user);

    operationRequest$.subscribe((operations: Operation[]) => {
        this.hydrationInFlightByGroupId[operationGroupId] = false;

        // Ignore stale async responses so older loads cannot collapse the current client roster.
        if (requestId !== this.latestHydrationRequestId) {
          return;
        }

        if (this.selected?.operationGroup?.operationGroupId !== operationGroupId) {
          return;
        }

        const safeOperations = Array.isArray(operations) ? operations : [];
        this.lastHydratedOperationGroupId = operationGroupId;
        this.selected.operationGroup = {
          operationGroupId,
          operationGroupName: this.selected.operationGroup?.operationGroupName || '',
          operationGroupShortName: this.selected.operationGroup?.operationGroupShortName || '',
          operationGroupActive:
            Number(this.selected.operationGroup?.operationGroupActive) === 0
              ? 0
              : 1,
          operations: safeOperations
        };
        this._cdr.detectChanges();
      });
  }

  private normalizeOperationGroup(operationGroup: OperationGroup): OperationGroup {
    return {
      ...operationGroup,
      operationGroupActive: Number(operationGroup?.operationGroupActive) === 0 ? 0 : 1,
      operations: Array.isArray(operationGroup?.operations) ? operationGroup.operations : []
    };
  }

  private findOperationGroupById(operationGroupId: string): OperationGroup | null {
    return (
      this.operationGroups.find(
        (operationGroup: OperationGroup) => operationGroup.operationGroupId == operationGroupId
      ) || null
    );
  }

  private preserveSelectedGroupOperations(nextOperationGroup: OperationGroup | null): OperationGroup | null {
    if (!nextOperationGroup) {
      return null;
    }

    const previousSelection = this.selected?.operationGroup;
    const previousOperations =
      previousSelection &&
      previousSelection.operationGroupId == nextOperationGroup.operationGroupId &&
      Array.isArray(previousSelection.operations)
        ? previousSelection.operations
        : [];

    const fallbackOperations = Array.isArray(nextOperationGroup.operations) ? nextOperationGroup.operations : [];

    return {
      ...nextOperationGroup,
      operations: previousOperations.length ? previousOperations : fallbackOperations
    };
  }

  private loadClientOperationGroups(done?: () => void) {
    this.operationService.getAllOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
      this.operationGroups = (Array.isArray(operationGroups) ? operationGroups : []).map((operationGroup: OperationGroup) =>
        this.normalizeOperationGroup(operationGroup)
      );

      if (done) {
        done();
      }
    });
  }

  restoreSelectedClient() {
    const operationGroupId = this.selected?.operationGroup?.operationGroupId;
    if (!this.clientMode || !operationGroupId || this.isRestoringClient || !this.selectedGroupIsArchived) {
      return;
    }

    this.isRestoringClient = true;
    this.operationService
      .restoreOperationGroupByOperationGroupId(operationGroupId)
      .pipe(finalize(() => (this.isRestoringClient = false)))
      .subscribe(() => {
        this.selected.operationGroup = {
          ...this.selected.operationGroup,
          operationGroupActive: 1
        };
        const found = this.findOperationGroupById(operationGroupId);
        if (found) {
          found.operationGroupActive = 1;
        }
        this._cdr.detectChanges();
      });
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user || ({} as User);
    this.pageTitle = this.route.snapshot.data.title || 'Operations';
    this.clientMode = this.route.snapshot.data.section === 'clients';
    this.operationGroups = (Array.isArray(this.user?.operationGroups) ? this.user.operationGroups : []).map(
      (operationGroup: OperationGroup) => this.normalizeOperationGroup(operationGroup)
    );

    this.route.paramMap.subscribe((data: any) => {
      const operationGroupId = data.get ? data.get('operationGroupId') : data.params?.operationGroupId;

      // Route reuse can briefly emit an empty id for /clients/:operationGroupId.
      // In client mode, ignore this transient emission when a selection already exists.
      if (this.clientMode && !operationGroupId && this.selected?.operationGroup?.operationGroupId) {
        return;
      }

      const applySelection = () => {
        if (operationGroupId) {
          this.selected.operationGroup = this.preserveSelectedGroupOperations(
            this.findOperationGroupById(operationGroupId)
          );

          if (!this.selected.operationGroup) {
            this.lastHydratedOperationGroupId = null;
            this.selected.operationGroup = {
              operationGroupId,
              operationGroupName: '',
              operationGroupShortName: '',
              operationGroupActive: 1,
              operations: []
            };
          }

          if (
            this.clientMode ||
            !Array.isArray(this.selected.operationGroup.operations) ||
            !this.selected.operationGroup.operations.length
          ) {
            this.hydrateSelectedGroupById(operationGroupId);
          }
        } else {
          this.selected.operationGroup = this.preserveSelectedGroupOperations(
            this.operationGroups.length ? this.operationGroups[0] : null
          );

          if (this.clientMode && this.selected.operationGroup?.operationGroupId) {
            this.hydrateSelectedGroupById(this.selected.operationGroup.operationGroupId);
          }
        }

        this._cdr.detectChanges();
      };

      if (this.clientMode) {
        this.loadClientOperationGroups(applySelection);
      } else {
        applySelection();
      }
    });
  }

  operationGroupChangeEventHandler(operationGroupId: string) {
    if (!operationGroupId) {
      return;
    }

    if (this.clientMode && this.selected?.operationGroup?.operationGroupId === operationGroupId) {
      return;
    }

    this.lastHydratedOperationGroupId = null;
    this.selected.operationGroup = this.preserveSelectedGroupOperations(this.findOperationGroupById(operationGroupId));

    if (!this.selected.operationGroup) {
      this.selected.operationGroup = {
        operationGroupId,
        operationGroupName: '',
        operationGroupShortName: '',
        operationGroupActive: 1,
        operations: []
      };
    }

    if (this.clientMode || !Array.isArray(this.selected.operationGroup.operations) || !this.selected.operationGroup.operations.length) {
      this.hydrateSelectedGroupById(operationGroupId);
    }
  }

  private getUserRoleValue(user: User): number {
    if (!user) {
      return 0;
    }

    if (typeof user.userLevel === 'number') {
      return user.userLevel;
    }

    return (UserRolesMap as any)[String(user.userLevel)] || 0;
  }
}
