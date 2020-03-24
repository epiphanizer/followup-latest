import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
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
import { Patient } from '@app/modules/patient/patient';

@Component({
  providers: [],
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
  currentNewDischargeCount: number;
  @Output() operationChangeEvent = new EventEmitter<number>();
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  isOpen = true;
  constructor(
    private route: ActivatedRoute,
    private operationService: OperationService,
    private patientService: PatientService
  ) {}
  operations: Operation[];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    // this.operations = this.user.operations;
    this.user.operations$.subscribe((data: Operation[]) => {
      /** Init to the first assigned operation alphabetically */
      this.operations = data;
      // this.operations.forEach((operation: Operation, idx: number) => {
      //   this.patientService
      //     .getActivePatientListByOperationId(operation.operationId)
      //     .subscribe((patients: Patient[]) => {
      //       if (patients !== null) {
      //         this.operations[idx].currentNewDischargeCount = this.getCurrentNewDischargeCount(patients);
      //       } else {
      //         this.operations[idx].currentNewDischargeCount = 0;
      //       }
      //     });
      // });
      this.route.paramMap.subscribe((data: any) => {
        if (data.params.operationId) {
          this.operationService.getOperationByOperationId(data.params.operationId).subscribe((data: Operation) => {
            this.selected.operation = data[0];
            this.patientService
              .getActivePatientListByOperationId(this.selected.operation.operationId)
              .subscribe((patients: Patient[]) => {
                if (patients !== null) {
                  this.getCurrentNewDischargeCount(patients);
                }
              });
          });
        } else {
          /** Init to the first user operation (alphabetically,) */
          this.selected.operation = this.operations[0];
        }
      });
    });

    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  public getCurrentNewDischargeCount(patients: Patient[]) {
    let patientsWithNoCalls = [];
    patientsWithNoCalls = patients.filter(function(patient: Patient) {
      return patient.patientCallCount - 1 == 0;
    });
    return patientsWithNoCalls.length;
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.operationChangeEvent.emit(operation);
  };
  public toggleOperationSidebarMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
