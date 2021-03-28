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

  activeOperationId: number;
  availableUsers: User[];
  fb: FormBuilder;
  callRepsForm: FormArray;
  managersForm: FormArray;
  managerSidebarDropdownOpen: boolean = true;
  callRepSidebarDropdownOpen: boolean = true;
  operation: Operation | null;
  isOpen: boolean = true;
  operationCallReps: OperationCallRep[];
  operationCallRepsToAdd: OperationCallRep[];
  operationCallRepsOriginal: number[];
  operationCallRepsToRemove: number[] = [];
  operationManagers: OperationManager[] = [];
  operationManagersOriginal: number[] = [];
  operationManagersToAdd: OperationManager[] = [];
  operationManagersToRemove: number[] = [];
  constructor(
    private route: ActivatedRoute,
    private logService: LogService,
    private operationService: OperationService,
    private operationCallRepsService: OperationCallRepsService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}
  operations: Operation[];
  operationAssignedUsers: any[];
  operationAssignedManagers: any[];
  user: User;
  todaysDateDay: number;
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
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    if (this.route.snapshot.paramMap.get('operationId')) {
      this.activeOperationId = parseInt(this.route.snapshot.paramMap.get('operationId'));
      this.updateAssignedUsers();
    }
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.operationAssignedUsers = [];
        this.activeOperationId = parseInt(params.get('operationId'));
        this.updateAssignedUsers();
        this.updateAssignedManagers();
      }
    });
    if (this.mode.add) {
      this.operationManagers = [
        {
          userId: 0,
          operationId: this.operation.operationId,
          operationManagerName: ''
        }
      ];
      // Arm an initial call rep
      this.operationCallReps = [
        {
          userId: 0,
          operationId: this.operation.operationId,
          operationCallRepName: ''
        }
      ];
    }
  }
  updateAssignedUsers() {
    this.operationService
      .getUsersAssignedByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((users: User[]) => {
          if (users) {
            this.operationAssignedUsers = users;
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
  updateAssignedManagers() {
    this.operationService
      .getOperationManagersByOperationId(this.activeOperationId)
      .pipe(
        take(1),
        map((managers: OperationManager[]) => {
          if (managers) {
            this.operationAssignedManagers = managers;
          } else {
            if (!this.mode.edit) {
              this.managerSidebarDropdownOpen = false;
            } else {
              for (var i = 0; i < 1; i++) {
                this.operationAssignedManagers.push({});
              }
            }
          }
        })
      )
      .subscribe();
  }

  // removeOperationManager(idx: number) {
  //   this.operationManagersToRemove.push(this.operationManagers[idx].userId);
  //   this.operationManagers.splice(idx, 1);
  // }
  // removeOperationCallRep(idx: number) {
  //   this.operationCallRepsToRemove.push(this.operationCallReps[idx].userId);
  //   this.operationCallReps.splice(idx, 1);
  // }
  // callRepOnSelect(event: any, index: number) {
  //   let callRepUserId = event.target.value;
  //   if (this.operationCallReps[index].userId !== 0) {
  //     this.operationCallRepsToRemove.push(this.operationCallReps[index].userId);
  //   }
  //   var operationCallRepObject = {
  //     operationId: this.operation.operationId,
  //     userId: callRepUserId
  //   };
  //   this.operationCallReps[index] = operationCallRepObject;
  // }
  // managerOnSelect(event: any, index: number) {
  //   let managerUserId = event.target.value;
  //   if (this.operationManagers[index].userId !== 0) {
  //     this.operationManagersToRemove.push(this.operationManagers[index].userId);
  //   }
  //   var operationManagerObject = {
  //     operationId: this.operation.operationId,
  //     userId: managerUserId
  //   };
  //   this.operationManagers[index] = operationManagerObject;
  // }
  public toggleOperationManagersAssignedMenu = function() {
    this.managerSidebarDropdownOpen = !this.managerSidebarDropdownOpen;
  };
  public toggleOperationCallRepsAssignedMenu = function() {
    this.callRepSidebarDropdownOpen = !this.callRepSidebarDropdownOpen;
  };
  // this.operationManagersToRemove.forEach((managerUserId: number) => {
  //   // Don't process default manager entry
  //   if (managerUserId == 0) {
  //     return;
  //   }
  //   this.operationService
  //     .removeOperationManagerByOperationIdAndUserId(this.operation.operationId, managerUserId)
  //     .subscribe(() => {
  //       this.toastr.success('Manager successfully removed');
  //     });
  // });

  // This passes E2E
  // this.operationManagersToAdd = this.operationManagers.filter((operationManager: OperationManager, index: number) => {
  //   return operationManager.userId !== this.operationManagersOriginal[index] && operationManager.userId !== 0;
  // });
  // this.operationManagersToAdd.forEach((operationManager: OperationManager) => {
  //   this.operationService
  //     .assignManagerToOperationByOperationIdAndUserId(operationManager.operationId, operationManager.userId)
  //     .subscribe(() => {
  //       this.toastr.success('Manager successfully added');
  //     });
  // });

  // // Passes E2E
  // this.operationCallRepsToRemove.forEach((callRepUserId: number, index: number) => {
  //   if (callRepUserId == 0) {
  //     return;
  //   }
  //   this.operationCallRepsService
  //     .deleteOperationCallRepByOperationCallRepId(this.operation.operationId, callRepUserId)
  //     .subscribe(() => {
  //       this.toastr.success('Care Rep successfully added');
  //     });
  // });

  // this.operationCallRepsToAdd = this.operationCallReps.filter((operationCallRep: OperationCallRep, index: number) => {
  //   return operationCallRep.userId !== this.operationCallRepsOriginal[index] && operationCallRep.userId !== 0;
  // });
  // /**
  //  * Make sure we only add uniques
  //  */
  // this.operationCallRepsToAdd = Array.from(new Set(this.operationCallRepsToAdd));
  // this.operationCallRepsToAdd.forEach((operationCallRep: OperationCallRep) => {
  //   this.operationCallRepsService
  //     .addOperationCallRepByOperationIdAndUserId(this.operation.operationId, operationCallRep.userId)
  //     .subscribe(() => {
  //       this.toastr.success('Care Rep successfully added');
  //     });
  // });
}
