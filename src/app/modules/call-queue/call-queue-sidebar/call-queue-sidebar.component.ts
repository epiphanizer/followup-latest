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
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private operationService: OperationService,
    private patientService: PatientService
  ) {}
  operationGroups: OperationGroup[] = null;
  operationGroups$: Observable<OperationGroup[]>;
  operations: Operation[];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.operationGroups$ = this.operationService.getOperationGroups();
    this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
      if (operationGroups) {
        this.operationGroups = operationGroups;
        console.log(operationGroups);
        this.operationGroups.forEach((operationGroup: OperationGroup) => {
          operationGroup.operations$ = this.operationService.getOperationsByOperationGroupId(operationGroup);
          console.log('got operatoin group stuff');
        });
      }
    });
    this.user = this.route.snapshot.data.user;
    // this.operations = this.user.operations;
    this.user.operations$.subscribe((data: Operation[]) => {
      /** Init to the first assigned operation alphabetically */
      this.operations = data;
      console.log(data);
      this.operations.forEach((operation: Operation, idx: number) => {
        // console.log(operation);
        // var thisOperationGroup = {
        //   operationGroupId: operation.operationGroupId,
        //   operationGroupName: operation.operationGroupName
        // };
        // if (
        //   !this.operationGroups.find(
        //     operationGroup => operationGroup.operationGroupId == thisOperationGroup.operationGroupId
        //   )
        // )
        //   // if (this.operationGroups.indexOf(operationGroup) == -1) {
        //   this.operationGroups.push(thisOperationGroup);
        // console.log('pushing ops group');
        // }
      });
    });
    this.route.paramMap.subscribe((data: any) => {
      if (data.params.operationId) {
        this.operationService.getOperationByOperationId(data.params.operationId).subscribe((data: Operation) => {
          this.selected.operation = data[0];
          this.patientService
            .getActivePatientListByOperationId(this.selected.operation.operationId)
            .subscribe((patients: Patient[]) => {
              if (patients !== null) {
                console.log('getting patient count');
                // this.getCurrentNewDischargeCount(patients);
              }
            });
        });
      } else {
        /** Init to the first user operation (alphabetically,) */
        this.selected.operation = this.operations[0];
      }
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
}
