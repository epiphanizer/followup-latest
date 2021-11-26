import { Component, Input, OnInit } from '@angular/core';
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
import { Operation, OperationManager, OperationCallRep } from '../operation';
import { take, map } from 'rxjs/operators';
import { OperationCallRepsService } from '../operation-callreps.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '@app/modules/user/user.service';
import { LogService } from '@app/shared/log/log.service';

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
export class OperationAdminRightSidebarComponent implements OnInit {
  @Input() mode: any;
  @Input() operation: Operation;

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
  operationManager: OperationManager;
  operationManagerOriginal: OperationManager;
  constructor(
    private route: ActivatedRoute,
    private logService: LogService,
    private operationService: OperationService,
    private operationCallRepsService: OperationCallRepsService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  user: User;
  ngOnInit() {
    this.userService.getAllUsers().subscribe((users: User[]) => {
      try {
        if (users) {
          this.availableUsers = users;
        } else {
          throw 'No users found!';
        }
      } catch (error) {
        this.logService.log(error);
      }
      if (users) {
        this.availableUsers = users;
      } else {
        throw 'No users found!';
      }
    });

    if (this.route.snapshot.paramMap.get('operationId')) {
      this.activeOperationId = this.route.snapshot.paramMap.get('operationId');
      this.updateAssignedUsers();
      this.updateAssignedManager();
    }
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.operationAssignedUsers = [];
        this.activeOperationId = params.get('operationId');
        this.updateAssignedUsers();
        this.updateAssignedManager();
      }
    });
    if (this.mode.add) {
      this.operationManager = {
        userId: null,
        operationId: this.operation.operationId,
        operationManagerName: ''
      };
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
  updateAssignedUsers() {
    this.operationAssignedUsers = [];
    this.operationAssignedUsersOriginal = [];
    this.operationService
      .getUsersAssignedByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((users: User[]) => {
          if (users) {
            this.operationAssignedUsers = users.filter(user => {
              return user.userRoleType != 'Manager';
            });
            this.operationAssignedUsers = this.operationAssignedUsers.filter((operationCallRep: OperationCallRep) => {
              return operationCallRep.userRoleLabel != 'Manager';
            });
            this.operationAssignedUsersOriginal = this.operationAssignedUsers;
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
  updateAssignedManager() {
    this.operationService
      .getOperationManagersByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((managers: OperationManager[]) => {
          if (managers[0]) {
            this.operationManager = managers[0];
            this.operationManagerOriginal = managers[0];
          } else {
            this.operationManager = this.operationManagerOriginal = {
              userId: null,
              operationId: null
            };
          }
        })
      )
      .subscribe();
  }

  removeOperationCallRep(idx: number) {
    this.operationAssignedUsersToRemove.push(this.operationAssignedUsers[idx].userId);
    this.operationAssignedUsers.splice(idx, 1);
  }

  callRepOnSelect(event: any, index: number) {
    let callRepUserId = event.target.value;
    if (this.operationAssignedUsers[index].userId !== 0) {
      this.operationAssignedUsersToRemove.push(this.operationAssignedUsers[index].userId);
    }
    var operationCallRepObject = {
      operationId: this.operation.operationId,
      userId: callRepUserId
    };
    this.operationAssignedUsers[index] = operationCallRepObject;
    // Passes E2E
    if (this.operationAssignedUsersToRemove.length) {
      this.operationAssignedUsersToRemove.forEach((callRepUserId: string, index: number) => {
        if (callRepUserId == null) {
          return;
        }
        this.operationCallRepsService
          .deleteOperationCallRepByOperationCallRepId(this.operation.operationId, callRepUserId)
          .subscribe(() => {});
      });
    }

    /**
     * Make sure we only add uniques
     */
    this.operationAssignedUsersToAdd = this.operationAssignedUsers.filter(
      (operationCallRep: OperationCallRep, index: number) => {
        return (
          operationCallRep.userId !== this.operationAssignedUsersOriginal[index] && operationCallRep.userId !== null
        );
      }
    );
    let count = 0;
    this.operationAssignedUsersToAdd = Array.from(new Set(this.operationAssignedUsersToAdd));
    this.operationAssignedUsersToAdd.forEach((operationCallRep: OperationCallRep) => {
      this.operationCallRepsService
        .addOperationCallRepByOperationIdAndUserId(this.operation.operationId, operationCallRep.userId)
        .subscribe(() => {
          count++;
          if (count == this.operationAssignedUsers.length) {
            this.toastr.success('Care Reps successfully saved');
          }
        });
    });
  }

  addAdditionalOperationCallRep() {
    let newCallRep = {
      userId: 0,
      operationId: this.operation.operationId,
      operationCallRepName: ''
    };
    this.operationAssignedUsers.push(newCallRep);
  }
  managerOnSelect(event: any, index: number) {
    let managerUserId = event.target.value;

    var operationManagerObject = {
      operationId: this.operation.operationId,
      userId: managerUserId
    };
    this.operationManager = operationManagerObject;

    // Don't process default manager entry
    if (managerUserId == 0) {
      return;
    }
    if (this.operationManagerOriginal.userId) {
      this.operationService
        .removeOperationManagerByOperationIdAndUserId(this.operation.operationId, this.operationManagerOriginal.userId)
        .subscribe(() => {
          this.operationService
            .assignManagerToOperationByOperationIdAndUserId(
              this.operationManager.operationId,
              this.operationManager.userId
            )
            .subscribe(() => {
              this.operationManagerOriginal = this.operationManager;
              this.toastr.success('Manager successfully Added');
            });
        });
    } else {
      this.operationService
        .assignManagerToOperationByOperationIdAndUserId(this.operationManager.operationId, this.operationManager.userId)
        .subscribe(() => {
          this.operationManagerOriginal = this.operationManager;
          this.toastr.success('Manager successfully Added');
        });
    }
  }
  public toggleOperationManagersAssignedMenu = function() {
    this.managerSidebarDropdownOpen = !this.managerSidebarDropdownOpen;
  };
  public toggleOperationCallRepsAssignedMenu = function() {
    this.callRepSidebarDropdownOpen = !this.callRepSidebarDropdownOpen;
  };
}
