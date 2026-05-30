import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
import { Operation, OperationManager, OperationCallRep } from '../operation';
import { take, map } from 'rxjs/operators';
import { OperationCallRepsService } from '../operation-callreps.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '@app/modules/user/user.service';
import { LogService } from '@app/shared/log/log.service';
import { Observable, Subscribable, SubscriptionLike } from 'rxjs';

@Component({
  selector: 'app-operation-admin-right-sidebar',
  templateUrl: './operation-admin-right-sidebar.component.html',
  styleUrls: ['./operation-admin-right-sidebar.component.scss'],
  providers: [OperationCallRepsService],
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
export class OperationAdminRightSidebarComponent implements OnInit, OnChanges {
  @Input() mode: any;
  @Input() operation: Operation;
  @Input() users: User[];

  activeOperationId: string;
  availableUsers: User[] = [];
  fb: FormBuilder;
  callRepsForm: FormArray;
  managersForm: FormArray;
  managerSidebarDropdownOpen: boolean = true;
  callRepSidebarDropdownOpen: boolean = true;

  isOpen: boolean = true;

  operationAssignedUsers: any[];
  operationAssignedUsersToAdd: OperationCallRep[];
  operationAssignedUsersOriginal: string[];
  operationAssignedUsersToRemove: string[] = [];

  operationManagers: any[];
  operationManagersToAdd: OperationManager[];
  operationManagersOriginal: string[];
  operationManagersToRemove: string[] = [];
  effectiveAssignedUsers: User[] = [];
  ready: boolean = false;
  routeSubscription: SubscriptionLike;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private operationService: OperationService,
    private operationCallRepsService: OperationCallRepsService,
    private toastr: ToastrService
  ) {}

  user: User;
  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const operationId =
        params.get('operationId') ||
        this.route.snapshot.queryParamMap.get('operationId') ||
        this.operation?.operationId;

      if (operationId) {
        this.initializeOperationContext(operationId);
      }
    });
    if (this.mode.add) {
      this.operationManagers = [
        {
          userId: '',
          operationId: this.operation.operationId,
          operationManagerName: ''
        }
      ];
      // Arm an initial call rep
      this.operationAssignedUsers = [
        {
          userId: null,
          operationId: this.operation.operationId,
          operationCallRepName: ''
        }
      ];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.operation?.currentValue?.operationId) {
      const operationId = changes.operation.currentValue.operationId;
      if (operationId && operationId !== this.activeOperationId) {
        this.initializeOperationContext(operationId);
      }
    }
  }
  private initializeOperationContext(operationId: string) {
    this.activeOperationId = operationId;
    this.effectiveAssignedUsers = [];
    this.operationManagers = [];
    this.operationManagersOriginal = [];
    this.operationManagersToAdd = [];
    this.operationManagersToRemove = [];
    this.operationAssignedUsers = [];
    this.operationAssignedUsersOriginal = [];
    this.operationAssignedUsersToAdd = [];
    this.operationAssignedUsersToRemove = [];
    this.refreshEffectiveAssignments();
  }

  refreshEffectiveAssignments(): any {
    if (!this.activeOperationId) {
      return;
    }

    return this.operationService
      .getUsersAssignedByOperationId(this.activeOperationId)
      .pipe(
        map((users: User[]) => {
          this.effectiveAssignedUsers = (users || []).sort((left: User, right: User) => {
            const lastNameDifference = (left.userLastName || '').localeCompare(right.userLastName || '');
            if (lastNameDifference !== 0) {
              return lastNameDifference;
            }

            return (left.userFirstName || '').localeCompare(right.userFirstName || '');
          });
          this.syncManagerRowsFromEffectiveAssignments();
          this.syncCallRepRowsFromEffectiveAssignments();
        })
      )
      .subscribe();
  }

  updateAssignedUsers(): any {
    this.operationAssignedUsers = [];
    this.operationAssignedUsersOriginal = [];
    if (!this.activeOperationId) {
      return;
    }
    this.syncCallRepRowsFromEffectiveAssignments();
  }
  getAssignedManagers() {
    this.operationManagers = [];
    this.operationManagersOriginal = [];
    if (!this.activeOperationId) {
      return;
    }
    this.syncManagerRowsFromEffectiveAssignments();
  }

  callRepOnSelect(event: any, index: number) {
    let callRepUserId = event?.detail?.value ?? event?.target?.value;
    if (!callRepUserId) {
      return;
    }
    const previousUserId = this.operationAssignedUsers[index]?.userId;
    if (previousUserId && previousUserId !== 0 && previousUserId !== callRepUserId) {
      this.operationCallRepsService
        .deleteOperationCallRepByOperationCallRepId(this.activeOperationId, previousUserId)
        .subscribe(() => {});
    }
    var operationCallRepObject = {
      operationId: this.activeOperationId,
      userId: callRepUserId
    };
    this.operationAssignedUsers[index] = operationCallRepObject;
    if (this.operationAssignedUsersOriginal?.length) {
      /**
       * Make sure we only add uniques
       */
      this.operationAssignedUsersToAdd = this.operationAssignedUsers.filter((operationCallRep: OperationCallRep) => {
        return operationCallRep.userId !== '' && !this.operationAssignedUsersOriginal.includes(operationCallRep.userId);
      });
    } else {
      this.operationAssignedUsersToAdd = this.operationAssignedUsers;
    }
    if (!this.operationAssignedUsersToAdd) {
      return;
    }
    let count = 0;
    this.operationAssignedUsersToAdd = Array.from(new Set(this.operationAssignedUsersToAdd));
    this.operationAssignedUsersToAdd.forEach((operationCallRep: OperationCallRep) => {
      this.operationCallRepsService
        .addOperationCallRepByOperationIdAndUserId(this.activeOperationId, operationCallRep.userId)
        .subscribe(() => {
          count++;
          if (count == this.operationAssignedUsersToAdd?.length) {
            this.toastr.success('Care Reps successfully saved');
            this.refreshEffectiveAssignments();
          }
        });
    });
  }

  addAdditionalOperationCallRep() {
    let newCallRep = {
      userId: 0,
      operationId: this.activeOperationId,
      operationCallRepName: ''
    };
    this.operationAssignedUsers.push(newCallRep);
  }
  addAdditionalOperationManager() {
    let newManager = {
      userId: 0,
      operationId: this.activeOperationId,
      operationManagerName: ''
    };
    this.operationManagers.push(newManager);
  }
  managerOnSelect(event: any, index: number) {
    let managerUserId = event?.detail?.value ?? event?.target?.value;
    if (!managerUserId) {
      return;
    }
    if (this.operationManagers[index]?.userId && this.operationManagers[index].userId !== 0) {
      this.operationManagersToRemove.push(this.operationManagers[index].userId);
    }

    var operationManagerObject = {
      operationId: this.activeOperationId,
      userId: managerUserId
    };
    this.operationManagers[index] = operationManagerObject;
    // Passes E2E
    if (this.operationManagersToRemove?.length) {
      this.operationManagersToRemove.forEach((manager: string) => {
        if (manager == '') {
          return;
        }
        this.operationService.removeManagerByOperationIdAndUserId(this.activeOperationId, manager).subscribe(() => {});
      });
    }

    /**
     * Make sure we only add uniques
     */
    if (this.operationManagersOriginal?.length) {
      this.operationManagersToAdd = this.operationManagers.filter(
        (operationManager: OperationManager, index: number) => {
          if (this.operationManagersOriginal[index]) {
            return this.operationManagersOriginal[index] !== operationManager.userId && operationManager.userId !== '';
          }
          return operationManager.userId !== '';
        }
      );
    } else {
      this.operationManagersToAdd = this.operationManagers;
    }
    if (!this.operationManagersToAdd?.length) {
      return;
    }
    let count = 0;
    this.operationManagersToAdd = Array.from(new Set(this.operationManagersToAdd));
    this.operationManagersToAdd.forEach((manager: OperationManager) => {
      this.operationService
        .assignManagerToOperationByOperationIdAndUserId(this.activeOperationId, manager.userId)
        .subscribe(() => {
          count++;
          if (count == this.operationManagersToAdd?.length) {
            this.toastr.success('Manager successfully saved');
            this.refreshEffectiveAssignments();
          }
        });
    });
  }
  public toggleOperationManagersAssignedMenu = function() {
    this.managerSidebarDropdownOpen = !this.managerSidebarDropdownOpen;
  };
  public toggleOperationCallRepsAssignedMenu = function() {
    this.callRepSidebarDropdownOpen = !this.callRepSidebarDropdownOpen;
  };
  public removeCallRepOrManager(type: string, idx: number, userId: string) {
    if (!userId || userId === '0') {
      this.toastr.error('Please select a valid user before removing.');
      return;
    }
    const row = type === 'manager' ? this.operationManagers[idx] : this.operationAssignedUsers[idx];
    if (!this.isDirectAssignment(row)) {
      this.toastr.error('This assignment is inherited from Team Access. Update it from the Teams section.');
      return;
    }
    const request =
      type === 'manager'
        ? this.operationService.removeManagerByOperationIdAndUserId(this.activeOperationId, userId)
        : this.operationService.removeCallRepOrManager(this.activeOperationId, userId);
    request.subscribe({
      next: () => {
        this.toastr.success('Successfully removed the user.');
        switch (type) {
          case 'manager':
            this.operationManagersToRemove.push(this.operationManagers[idx].userId);
            this.operationManagers.splice(idx, 1);
            this.refreshEffectiveAssignments();
            break;
          case 'callrep':
            this.operationAssignedUsersToRemove.push(this.operationAssignedUsers[idx].userId);
            this.operationAssignedUsers.splice(idx, 1);
            this.refreshEffectiveAssignments();
            break;
        }
      },
      error: () => {
        this.toastr.error('Oops! Could not remove the user.');
      }
    });
  }

  isDirectAssignment(user: User | any): boolean {
    return Number(user?.directOperationUserRoleLabelId) > 0 || !user?.accessSourceLabel;
  }

  isInheritedOnlyAssignment(user: User | any): boolean {
    return !this.isDirectAssignment(user) && Number(user?.inheritedOperationUserRoleLabelId) > 0;
  }

  getAssignmentSourceLabel(user: User | any): string {
    return (user?.accessSourceLabel || (this.isDirectAssignment(user) ? 'Direct' : '')).trim();
  }

  getAssignmentDetail(user: User | any): string {
    const details: string[] = [];

    if (user?.directOperationUserRoleLabel) {
      details.push('Direct: ' + user.directOperationUserRoleLabel);
    }

    if (user?.inheritedOperationUserRoleLabel) {
      details.push('Team: ' + user.inheritedOperationUserRoleLabel);
    }

    return details.join(' • ');
  }

  private syncCallRepRowsFromEffectiveAssignments() {
    const callReps = this.filterEffectiveUsersByRole('care');

    if (callReps.length) {
      this.operationAssignedUsers = callReps;
      this.operationAssignedUsersOriginal = callReps
        .filter(user => this.isDirectAssignment(user))
        .map(user => user.userId);
      return;
    }

    if (!this.mode.edit) {
      this.callRepSidebarDropdownOpen = false;
      return;
    }

    this.operationAssignedUsers = [];
    for (let index = 0; index < 3; index++) {
      this.operationAssignedUsers.push({});
    }
  }

  private syncManagerRowsFromEffectiveAssignments() {
    const managers = this.filterEffectiveUsersByRole('manager');

    if (managers.length) {
      this.operationManagers = managers;
      this.operationManagersOriginal = managers.filter(user => this.isDirectAssignment(user)).map(user => user.userId);
      return;
    }

    if (!this.mode.edit) {
      this.managerSidebarDropdownOpen = false;
      return;
    }

    this.operationManagers = [
      {
        userId: null,
        operationId: null
      }
    ];
  }

  private filterEffectiveUsersByRole(role: 'manager' | 'care'): User[] {
    return (this.effectiveAssignedUsers || []).filter(user => {
      const roleLabel = (user.operationUserRoleLabel || user.userRoleLabel || '').toLowerCase();
      return role === 'manager' ? roleLabel.includes('manager') : roleLabel.includes('care');
    });
  }
  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }
}
