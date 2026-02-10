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
  ]
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
    this.operationManagers = [];
    this.operationManagersOriginal = [];
    this.operationManagersToAdd = [];
    this.operationManagersToRemove = [];
    this.operationAssignedUsers = [];
    this.operationAssignedUsersOriginal = [];
    this.operationAssignedUsersToAdd = [];
    this.operationAssignedUsersToRemove = [];
    this.getAssignedManagers();
    this.updateAssignedUsers();
  }
  updateAssignedUsers(): any {
    this.operationAssignedUsers = [];
    this.operationAssignedUsersOriginal = [];
    if (!this.activeOperationId) {
      return;
    }
    return this.operationService
      .getUsersAssignedByOperationId(this.activeOperationId)
      .pipe(
        map((users: User[]) => {
          if (users) {
            this.operationAssignedUsers = users
              .filter(user => {
                return user.userRoleLabel === 'Care Rep';
              })
              .sort((a: User, b: User) => a.userLastName.localeCompare(b.userLastName));
            this.operationAssignedUsersOriginal = this.operationAssignedUsers.map(function(user) {
              return user.userId;
            });
          } else {
            if (!this.mode.edit) {
              this.callRepSidebarDropdownOpen = false;
            } else {
              for (var i = 0; i < 3; i++) {
                this.operationAssignedUsers.push({});
              }
            }
          }
        })
      )
      .subscribe();
  }
  getAssignedManagers() {
    this.operationManagers = [];
    this.operationManagersOriginal = [];
    if (!this.activeOperationId) {
      return;
    }
    this.operationService
      .getOperationManagersByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((managers: OperationManager[]) => {
          if (managers) {
            this.operationManagers = managers.sort((a: OperationManager, b: OperationManager) =>
              a.userLastName.localeCompare(b.userLastName)
            );
            this.operationManagersOriginal = this.operationManagers.map(function(manager) {
              return manager.userId;
            });
            // this.cdr.detectChanges();
          } else {
            if (!this.mode.edit) {
              this.managerSidebarDropdownOpen = false;
            } else {
              for (var i = 0; i < 1; i++) {
                this.operationManagers.push({
                  userId: null,
                  operationId: null
                });
              }
            }
          }
        })
      )
      .subscribe();
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
            this.updateAssignedUsers();
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
            this.getAssignedManagers();
            break;
          case 'callrep':
            this.operationAssignedUsersToRemove.push(this.operationAssignedUsers[idx].userId);
            this.operationAssignedUsers.splice(idx, 1);
            this.updateAssignedUsers();
            break;
        }
      },
      error: () => {
        this.toastr.error('Oops! Could not remove the user.');
      }
    });
  }
  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }
}
