import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { formatDate } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';
import { Patient } from '../patient';
import { Observable } from 'rxjs';

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
  @Output() operationChangeEvent = new EventEmitter<string>();
  activeOperationId: string;
  errorFallback: boolean = false;
  selected: {
    operation: Operation | null;
  } = {
    operation: null
  };
  operationGroups: OperationGroup[] = null;

  operations: Operation[];
  user: User;
  todaysDateDay: string;

  constructor(private route: ActivatedRoute, private operationService: OperationService) {}

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
    this.user = this.route.snapshot.data.user;

    var operationGroups = this.user.operationGroups;
    operationGroups.forEach((operationGroup: OperationGroup, idx: number) => {
      operationGroup.operations$ = this.operationService.getActiveOperationsByOperationGroupId(
        operationGroup,
        this.user
      );
      if (idx == 0 && !this.activeOperationId) {
        operationGroup.sidebarDropdownOpen = true;
      } else {
        operationGroup.sidebarDropdownOpen = false;
      }
    });
    this.operationGroups = operationGroups;

    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.activeOperationId = params.get('operationId');
      } else {
        this.activeOperationId = this.user.operations[0].operationId;
      }
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
    });
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = this.selected.operation.operationId;
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
