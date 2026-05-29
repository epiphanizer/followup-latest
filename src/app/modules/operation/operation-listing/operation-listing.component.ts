import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { User, UserRolesMap } from '@app/modules/user/user';
import { OperationService } from '@app/modules/operation/operation.service';
import { ActivatedRoute } from '@angular/router';

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

  @Input() operationGroup: OperationGroup;

  public operations: Operation[];
  public operations$: Observable<[Operation]> | void = null;
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
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

    this.operationService
      .getActiveOperationsByOperationGroupId({ operationGroupId } as OperationGroup, this.user)
      .subscribe((operations: Operation[]) => {
        const safeOperations = Array.isArray(operations) ? operations : [];
        this.selected.operationGroup = {
          operationGroupId,
          operationGroupName: this.selected.operationGroup?.operationGroupName || '',
          operationGroupShortName: this.selected.operationGroup?.operationGroupShortName || '',
          operations: safeOperations
        };
        this._cdr.detectChanges();
      });
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user || ({} as User);
    this.pageTitle = this.route.snapshot.data.title || 'Operations';
    this.clientMode = this.route.snapshot.data.section === 'clients';
    this.operationGroups = Array.isArray(this.user?.operationGroups) ? this.user.operationGroups : [];

    this.route.paramMap.subscribe((data: any) => {
      const operationGroupId = data.get ? data.get('operationGroupId') : data.params?.operationGroupId;

      if (operationGroupId) {
        this.selected.operationGroup =
          this.operationGroups.find(
            (operationGroup: OperationGroup) => operationGroupId == operationGroup.operationGroupId
          ) || null;

        if (!this.selected.operationGroup) {
          this.selected.operationGroup = {
            operationGroupId,
            operationGroupName: '',
            operationGroupShortName: '',
            operations: []
          };
          this.hydrateSelectedGroupById(operationGroupId);
        }
      } else {
        this.selected.operationGroup = this.operationGroups.length ? this.operationGroups[0] : null;
      }

      this._cdr.detectChanges();
    });
  }

  operationGroupChangeEventHandler(operationGroupId: string) {
    this.selected.operationGroup =
      this.operationGroups.find(
        (operationGroup: OperationGroup) => operationGroup.operationGroupId == operationGroupId
      ) || null;

    if (!this.selected.operationGroup) {
      this.selected.operationGroup = {
        operationGroupId,
        operationGroupName: '',
        operationGroupShortName: '',
        operations: []
      };
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
