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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
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
  isOpen = true;
  constructor(private route: ActivatedRoute, private router: Router) {}
  operations: Operation[];
  user: User;
  todaysDateDay: number;
  ngOnInit() {
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    this.user = this.route.snapshot.data.user;
    this.user.operations$.subscribe((operations: Operation[]) => {
      this.operations = operations;
      if (!this.route.snapshot.params['operationId']) {
        /**
         * no active state if we are adding a patient
         */
        if (this.router.url.indexOf('patient/add') == -1) {
          this.activeOperationId = operations[0].operationId;
        } else {
          this.activeOperationId = null;
        }
      } else {
        if (this.route.snapshot.paramMap.get('operationId')) {
          this.activeOperationId = parseInt(this.route.snapshot.paramMap.get('operationId'));
        }
      }
    });
    this.route.paramMap.subscribe(params => {
      if (params.get('operationId')) {
        this.activeOperationId = parseInt(params.get('operationId'));
      }
    });
  }
  setActiveOperation = function(operation: Operation) {
    this.selected.operation = operation;
    this.activeOperationId = this.selected.operation.operationId;
    this.operationChangeEvent.emit(operation);
  };
  public toggleOperationSidebarMenu = function() {
    this.isOpen = !this.isOpen;
  };
}
