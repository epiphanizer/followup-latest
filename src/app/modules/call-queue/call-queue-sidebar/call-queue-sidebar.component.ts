import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { formatDate } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';

import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';
import { PatientService } from '@app/modules/patient/patient.service';

@Component({
  providers: [OperationService],
  selector: 'app-call-queue-sidebar',
  templateUrl: './call-queue-sidebar.component.html',
  styleUrls: ['./call-queue-sidebar.component.scss'],
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
      transition('open => closed', [animate('0.25s')]),
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
export class CallQueueSidebarComponent {
  currentAssignedSpanishDischargeCount: number;
  currentNewDischargeCount: number;
  @Output() operationChangeEvent = new EventEmitter<Operation>();
  errorFallback: boolean = false;
  isTouched: boolean = false;
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  activeOperationId: string;
  constructor(
    private route: ActivatedRoute,
    private operationService: OperationService,
    private patientService: PatientService
  ) {}
  operationGroups: OperationGroup[] = null;

  operations: Operation[];
  user: User;
  todaysDateDay: string;
  // set a default for no new discharges re: spanish patients
  spanishNewDischarges: boolean = false;
  ngOnInit() {
    /** Init to the first user operation (alphabetically,) */
    this.user = this.route.snapshot.data.user;
    this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
      if (!operationGroups?.length) {
        this.operationGroups = [];
        return;
      }
      operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
        this.operationService
          .getActiveOperationsByOperationGroupId(operationGroup, this.user)
          .subscribe((operations: Operation[]) => {
            operationGroup.operations = (operations || []).map((operation: Operation) => {
              return {
                ...operation,
                // Defensive coercion: DB values can be returned as strings.
                currentNewDischargeCount: Number(operation.currentNewDischargeCount) || 0,
                currentAssignedPatientCount: Number(operation.currentAssignedPatientCount) || 0
              };
            });
            if (idx == 0 && !this.selected.operation && operationGroup.operations.length) {
              this.selected.operation = operationGroup.operations[0];
              this.activeOperationId = this.selected.operation.operationId;
            }
          });
      });
      this.operationGroups = operationGroups;
    });

    this.route.paramMap.subscribe((data: any) => {
      var operationId;
      if (data.params.operationId) {
        operationId = data.params.operationId;
      } else {
        let firstGroup = this.operationGroups?.[0] || this.user.operationGroups[0];
        let firstOperation =
          firstGroup?.operations?.[0] ||
          this.user.operations.find(
            (operation: Operation) => operation.operationGroupId == firstGroup.operationGroupId
          );
        if (!firstOperation) {
          return;
        }
        operationId = firstOperation.operationId;
        this.operations = firstGroup?.operations || [];
      }
      this.operationService.getOperationByOperationId(operationId).subscribe((data: Operation | Operation[]) => {
        const operation = Array.isArray(data) ? data[0] : data;
        if (operation) {
          this.selected.operation = operation;
          this.activeOperationId = this.selected.operation.operationId;
        }
      });
    });

    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = operation.operationId;
    this.operationChangeEvent.emit(operation);
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
    if (!this.isTouched) this.isTouched = true;
    if (!operationGroup) {
      return;
    }
    operationGroup.sidebarDropdownOpen = !operationGroup.sidebarDropdownOpen;
  }

  hasNewDischarges(operation: Operation): boolean {
    return Number(operation?.currentNewDischargeCount) > 0;
  }
}
