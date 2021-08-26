import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  activeOperationId: number;
  editMode: boolean;
  @Output() operationChangeEvent = new EventEmitter<number>();
  @Output() operationGroupChangeEvent = new EventEmitter<number>();
  selected: {
    operation?: Operation | null;
  } = {
    operation: null
  };

  operationGroups: OperationGroup[] = [];
  operationGroups$: Observable<OperationGroup[]>;
  operations: Operation[] = [];
  user: User;
  todaysDateDay: string;
  constructor(private route: ActivatedRoute, private operationService: OperationService) {}
  ngOnInit() {
    if (!sessionStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
          operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(operationGroup).pipe(
            map((operations: Operation[]) => {
              if (operations) {
                if (idx == 0 && !this.selected.operation) {
                  this.selected.operation = operations[0];
                  this.activeOperationId = this.selected.operation.operationId;
                }
                return operations;
              }
            })
          );
          /**
           * Busted logic
           */
          if (idx == 0) {
            operationGroup.sidebarDropdownOpen = true;
          } else {
            operationGroup.sidebarDropdownOpen = false;
          }
        });
        this.operationGroups = operationGroups;
      });
    } else {
      var operationGroups = JSON.parse(sessionStorage.getItem('operationGroups'));
      operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
        operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(operationGroup);
        if (this.route.snapshot.params.operationGroupId) {
          if (this.route.snapshot.params.operationGroupId == operationGroup.operationGroupId) {
            this.setActiveOperationGroup(operationGroup);
          }
        }
      });
      this.operationGroups = operationGroups;
      console.log(this.operationGroups);
    }
    this.route.paramMap.subscribe(params => {
      if (params.get('operationGroupId')) {
        if (!this.operationGroups.length) {
          this.operationService.getOperationGroups().subscribe(operationGroups => {
            operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
              operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(operationGroup);
              if (parseInt(params.get('operationGroupId')) == operationGroup.operationGroupId) {
                this.setActiveOperationGroup(operationGroup);
              }
            });
          });
        } else {
          console.log('here');
          this.operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
            operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(operationGroup);
            if (parseInt(params.get('operationGroupId')) == operationGroup.operationGroupId) {
              console.log('here for' + params.get('operationGroupId'));
              operationGroup.sidebarDropdownOpen = true;
              this.setActiveOperationGroup(operationGroup);
            } else {
              operationGroup.sidebarDropdownOpen = false;
            }
          });
        }
      }
      if (params.get('operationId')) {
        this.activeOperationId = parseInt(params.get('operationId'));
        this.operationService.getOperationByOperationId(this.activeOperationId).subscribe((operation: Operation) => {
          this.selected.operation = operation[0];
          if (this.operationGroups) {
            this.operationGroups.forEach(operationGroup => {
              if (this.selected.operation.operationGroupId != operationGroup.operationGroupId) {
                operationGroup.sidebarDropdownOpen = false;
              } else {
                operationGroup.sidebarDropdownOpen = true;
              }
            });
          }
        });
      }
    });

    this.user = this.route.snapshot.data.user;
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.operationChangeEvent.emit(this.activeOperationId);
  };
  setActiveOperationGroup = function(operationGroup: OperationGroup) {
    operationGroup.sidebarDropdownOpen = true;
    /**
     * Reassign selected group
     */
    this.selected.operationGroup = operationGroup;
    this.activeOperationGroupId = operationGroup.operationGroupId;
    this.operationGroupChangeEvent.emit(this.activeOperationGroupId);
  };
  toggleOperationSidebarMenu(operationGroup: OperationGroup) {
    operationGroup.sidebarDropdownOpen = !operationGroup.sidebarDropdownOpen;
  }
}
