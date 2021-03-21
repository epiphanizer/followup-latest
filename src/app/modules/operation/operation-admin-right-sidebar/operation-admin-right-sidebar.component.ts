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

@Component({
  selector: 'app-operation-admin-right-sidebar',
  templateUrl: './operation-admin-right-sidebar.component.html',
  styleUrls: ['./operation-admin-right-sidebar.component.scss'],
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
  constructor(
    private route: ActivatedRoute,
    private operationService: OperationService,
    private operationCallRepsService: OperationCallRepsService,
    private toastr: ToastrService
  ) {}
  operations: Operation[];
  operationAssignedUsers: any[];
  operationAssignedManagers: any[];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
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
  public toggleOperationManagersAssignedMenu = function() {
    this.managerSidebarDropdownOpen = !this.managerSidebarDropdownOpen;
  };
  public toggleOperationCallRepsAssignedMenu = function() {
    this.callRepSidebarDropdownOpen = !this.callRepSidebarDropdownOpen;
  };
}
