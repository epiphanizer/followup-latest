import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { formatDate } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';
import { Patient } from '../patient';

@Component({
  providers: [OperationService],
  selector: 'app-patient-manager-sidebar',
  templateUrl: './patient-manager-sidebar.component.html',
  styleUrls: ['./patient-manager-sidebar.component.scss'],
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
export class PatientManagerSidebarComponent implements OnInit, OnChanges {
  @Output() operationChangeEvent = new EventEmitter<Operation>();
  @Input() selectedOperation: Operation | null = null;
  activeOperationId: string;
  errorFallback: boolean = false;
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  operationGroups: OperationGroup[] = null;

  @Input() user: User;
  todaysDateDay: string;

  constructor(private route: ActivatedRoute, private operationService: OperationService) {}

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.user = this.route.snapshot.data.user;
    this.operationGroups = (this.user.operationGroups || []).map((operationGroup: OperationGroup, idx: number) => {
      operationGroup.sidebarDropdownOpen = idx === 0;
      return operationGroup;
    });

    this.route.paramMap.subscribe((paramMap: any) => {
      const routeOperationId = paramMap.get('operationId');
      const defaultOperation = this.selectedOperation || this.getDefaultOperation();
      const operationId = routeOperationId || defaultOperation?.operationId;

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

      this.operationService.getOperationByOperationId(operationId).subscribe((data: Operation | Operation[]) => {
        const operation = Array.isArray(data) ? data[0] : data;
        this.setActiveOperationInternal(operation, false);
      });
    });
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
  setActiveOperationGroup = function(operationGroup: OperationGroup) {
    operationGroup.sidebarDropdownOpen = true;
    /**
     * Reassign selected group
     */
    this.selected.operationGroup = operationGroup;
    this.activeOperationGroupId = operationGroup.operationGroupId;
    this.operationGroupChangeEvent.emit(this.activeOperationGroupId);
  };

  public getCurrentNewDischargeCount(patients: Patient[]) {
    let patientsWithNoCalls = [];
    patientsWithNoCalls = patients.filter(function(patient: Patient) {
      return patient.patientCallCount - 1 == 0;
    });
    return patientsWithNoCalls.length;
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
    this.openOperationGroup(operation.operationGroupId);
    if (emitEvent) {
      this.operationChangeEvent.emit(operation);
    }
  }

  private getDefaultOperation(): Operation | null {
    for (const operationGroup of this.operationGroups || []) {
      if (!operationGroup.operations || !operationGroup.operations.length) {
        continue;
      }
      const activeOperation = operationGroup.operations.find((operation: Operation) => operation.operationActive !== 0);
      return activeOperation || operationGroup.operations[0];
    }
    return null;
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

  private openOperationGroup(operationGroupId: string) {
    if (!this.operationGroups || !this.operationGroups.length) {
      return;
    }
    this.operationGroups.forEach((group: OperationGroup) => {
      group.sidebarDropdownOpen = group.operationGroupId === operationGroupId;
    });
  }
}
