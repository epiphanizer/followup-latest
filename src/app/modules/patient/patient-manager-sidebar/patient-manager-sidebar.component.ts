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
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';
import { PatientService } from '../patient.service';
import { Patient } from '../patient';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
export class PatientManagerSidebarComponent implements OnInit {
  @Output() operationChangeEvent = new EventEmitter<number>();
  activeOperationId: number;
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  operationGroups: OperationGroup[] = null;
  operationGroups$: Observable<OperationGroup[]>;

  operations: Operation[];
  user: User;
  todaysDateDay: string;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private router: Router,
    private operationService: OperationService
  ) {}

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.user = this.route.snapshot.data.user;
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.activeOperationId = parseInt(params.get('operationId'));
      }
    });
    if (!sessionStorage.getItem('operationGroups')) {
      this.operationGroups$ = this.operationService.getOperationGroups();
      this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
        if (operationGroups) {
          operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
            operationGroup.operations$ = this.operationService
              .getActiveOperationsByOperationGroupId(operationGroup)
              .pipe(
                map((operations: any) => {
                  if (idx == 0) {
                    this.activeOperationId = operations[0].operationId;
                  }
                  return operations;
                })
              );
            if (idx == 0 && !this.selected.operation) {
              operationGroup.sidebarDropdownOpen = true;
            } else {
              operationGroup.sidebarDropdownOpen = false;
            }
          });
          this.operationGroups = operationGroups;
          // sessionStorage.setItem('operationGroups', JSON.stringify(operationGroups));
        }
      });
    } else {
      var operationGroups = JSON.parse(sessionStorage.getItem('operationGroups'));
      operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
        operationGroup.operations$ = this.operationService.getActiveOperationsByOperationGroupId(operationGroup);
        if (idx == 0 && !this.activeOperationId) {
          operationGroup.sidebarDropdownOpen = true;
        } else {
          operationGroup.sidebarDropdownOpen = false;
        }
      });
      this.operationGroups = operationGroups;
    }
    if (this.user.operations$) {
      this.user.operations$.subscribe((data: Operation[]) => {
        /** Init to the first assigned operation alphabetically */
        this.operations = data;
        this.route.paramMap.subscribe((data: any) => {
          if (data.params.operationId) {
            this.operationService.getOperationByOperationId(data.params.operationId).subscribe((data: Operation) => {
              this.selected.operation = data[0];
              this.activeOperationId = this.selected.operation.operationId;
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
    } else {
      this.route.paramMap.subscribe(params => {
        if (params.get('operationId')) {
          this.activeOperationId = parseInt(params.get('operationId'));
          this.operationService.getOperationByOperationId(this.activeOperationId).subscribe((operation: Operation) => {
            this.selected.operation = operation[0];
            if (this.operationGroups) {
              this.operationGroups.forEach(operationGroup => {
                if (this.selected.operation.operationGroupId != operationGroup.operationGroupId) {
                  operationGroup.sidebarDropdownOpen = false;
                }
              });
            }
          });
        }
      });
    }
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = this.selected.operation.operationId;
    this.operationChangeEvent.emit(operation);
  };

  public getCurrentNewDischargeCount(patients: Patient[]) {
    let patientsWithNoCalls = [];
    patientsWithNoCalls = patients.filter(function(patient: Patient) {
      return patient.patientCallCount - 1 == 0;
    });
    return patientsWithNoCalls.length;
  }
  toggleOperationSidebarMenu(operationGroup: OperationGroup) {
    operationGroup.sidebarDropdownOpen = !operationGroup.sidebarDropdownOpen;
  }
}
