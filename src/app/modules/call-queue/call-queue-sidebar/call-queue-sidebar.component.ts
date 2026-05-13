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

import { map } from 'rxjs/operators';

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

  private normalizeOperationCounters(operation: Operation) {
    if (!operation) {
      return;
    }

    operation.currentAssignedPatientCount = Number(operation.currentAssignedPatientCount) || 0;
    operation.currentNewDischargeCount = Number(operation.currentNewDischargeCount) || 0;
    operation.currentNewNotificationCount = Number(operation.currentNewNotificationCount) || 0;
  }

  hasNewDischarges(operation: Operation): boolean {
    return Number(operation?.currentNewDischargeCount) > 0;
  }

  private isSpanishOperation(operation: Operation): boolean {
    const spanishFlag: any =
      (operation as any)?.operationSpanishSpeaking ?? (operation as any)?.spanishSpeaking ?? false;

    if (typeof spanishFlag === 'boolean') {
      return spanishFlag;
    }

    if (typeof spanishFlag === 'number') {
      return spanishFlag === 1;
    }

    if (typeof spanishFlag === 'string') {
      const normalized = spanishFlag.trim().toLowerCase();
      return normalized === '1' || normalized === 'true' || normalized === 'yes';
    }

    return false;
  }

  private refreshSpanishNewDischarges() {
    const operationGroups = this.operationGroups?.length ? this.operationGroups : this.user?.operationGroups || [];
    const operations: Operation[] = operationGroups.reduce((acc: Operation[], operationGroup: OperationGroup) => {
      if (operationGroup?.operations?.length) {
        return acc.concat(operationGroup.operations);
      }
      return acc;
    }, []);

    this.spanishNewDischarges = operations.some((operation: Operation) => {
      this.normalizeOperationCounters(operation);
      return this.isSpanishOperation(operation) && this.hasNewDischarges(operation);
    });
  }

  ngOnInit() {
    /** Init to the first user operation (alphabetically,) */
    this.user = this.route.snapshot.data.user;
    if (!localStorage.getItem('operationGroups')) {
      this.operationService.getOperationGroups().subscribe((operationGroups: OperationGroup[]) => {
        operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
          operationGroup.operations$ = this.operationService
            .getActiveOperationsByOperationGroupId(operationGroup, this.user)
            .pipe(
              map((operations: Operation[]) => {
                if (operations) {
                  operations.forEach((operation: Operation) => this.normalizeOperationCounters(operation));
                  operationGroup.operations = operations;
                  this.refreshSpanishNewDischarges();
                  if (idx == 0 && !this.selected.operation) {
                    this.selected.operation = operations[0];
                    this.activeOperationId = this.selected.operation.operationId;
                  }
                  return operations;
                }
              })
            );
        });
        this.operationGroups = operationGroups;
        this.refreshSpanishNewDischarges();
      });
    } else {
      this.operationGroups = this.user.operationGroups;
      this.operationGroups?.forEach((operationGroup: OperationGroup) => {
        operationGroup.operations?.forEach((operation: Operation) => this.normalizeOperationCounters(operation));
      });
      this.refreshSpanishNewDischarges();
    }

    this.route.paramMap.subscribe((data: any) => {
      var operationId;
      if (data.params.operationId) {
        operationId = data.params.operationId;
      } else {
        let firstGroup = this.user.operationGroups[0];
        let firstOperation = this.user.operations.find(
          (operation: Operation) => operation.operationGroupId == firstGroup.operationGroupId
        );
        operationId = firstOperation.operationId;
        this.operations = this.user.operationGroups[0].operations;
      }
      this.operationService.getOperationByOperationId(operationId).subscribe((data: Operation | Operation[]) => {
        const operation = Array.isArray(data) ? data[0] : data;
        if (operation) {
          this.normalizeOperationCounters(operation);
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
    operationGroup.sidebarDropdownOpen = !operationGroup.sidebarDropdownOpen;
  }
}
