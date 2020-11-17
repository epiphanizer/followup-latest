import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  PatientCallStatus,
  PatientCallStatusService
} from '@app/modules/patient/patient-detail/patient-call/patient-call-status.service';
import { PatientCallService } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';

@Component({
  providers: [PatientService, PatientCallService],
  selector: 'app-call-queue-patient-listing[operation]',
  templateUrl: './call-queue-patient-listing.component.html',
  styleUrls: ['./call-queue-patient-listing.component.scss']
})
export class CallQueuePatientListingComponent implements OnInit {
  pageOfItems: Patient[];
  currentYear: number;
  currentNewDischargeCount: number;
  todaysCallCount: number;
  @Input() operation: Operation;
  // we default to filtering by next call-date
  filterBy: string = 'discharge-date';
  public patients: Patient[];
  public patients$: Observable<Patient[]> | void = null;
  public patientCallStatuses: PatientCallStatus[];
  public todaysDate: Date;
  public selectedSortFlag: string = 'asc';

  constructor(private patientService: PatientService, private patientCallStatusService: PatientCallStatusService) {}
  ngOnInit() {
    this.todaysDate = new Date();
    this.currentYear = new Date().getFullYear();
    this.patientCallStatusService.getPatientCallStatuses().subscribe((patientCallStatuses: PatientCallStatus[]) => {
      this.patientCallStatuses = patientCallStatuses;
    });
    this.patients$ = this.patientService.getActivePatientListByOperationId(this.operation.operationId).pipe(
      take(1),
      map((patients: Patient[]) => {
        this.patients = patients;
        if (patients) {
          this.getCurrentNewDischargeCount(patients);
          this.getTodaysCallCount(patients);
          this.sortPatientsByCallDate(this.selectedSortFlag);
        }
        return patients;
      })
    );
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      if (!changes.operation.firstChange) {
        this.operation = changes.operation.currentValue;
        this.patients$ = this.patientService.getActivePatientListByOperationId(this.operation.operationId).pipe(
          map((patients: Patient[]) => {
            this.patients = patients;
            if (patients) {
              this.getCurrentNewDischargeCount(patients);
              this.getTodaysCallCount(patients);
              this.sortPatientsByCallDate(this.selectedSortFlag);
            } else {
              this.getCurrentNewDischargeCount([]);
              this.getTodaysCallCount([]);
            }
            return patients;
          })
        );
      }
    }
  }

  public checkDateGreaterThanEqualToToday(patientNextCallScheduledTime: string) {
    let patientNextCallDateObj = new Date(patientNextCallScheduledTime);
    if (patientNextCallDateObj <= this.todaysDate) {
      return true;
    } else {
      return false;
    }
  }
  public getCurrentNewDischargeCount(patients: Patient[]) {
    let patientsWithNoCalls = [];
    if (patients) {
      patientsWithNoCalls = patients.filter(function(patient: Patient) {
        return patient.patientCallCount - 1 == 0;
      });
    }
    this.currentNewDischargeCount = patientsWithNoCalls.length;
  }
  public getTodaysCallCount(patients: Patient[]) {
    var patientsWithCallsTodayOrBefore = new Array();
    var self = this;
    if (patients) {
      patientsWithCallsTodayOrBefore = patients.filter(function(patient: Patient) {
        return new Date(patient.patientNextCallScheduledTime) <= self.todaysDate;
      });
    }
    this.todaysCallCount = patientsWithCallsTodayOrBefore.length;
  }
  public sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'discharge-date';
    if (sortFlag == 'asc') {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(a.patientDischargeDate) - <any>new Date(b.patientDischargeDate);
        })
        .slice();
    } else {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(b.patientDischargeDate) - <any>new Date(a.patientDischargeDate);
        })
        .slice();
    }
  };
  public sortPatientsByCallDate = function(sortFlag: string) {
    this.filterBy = 'call-date';
    if (sortFlag == 'asc') {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(a.patientNextCallScheduledTime) - <any>new Date(b.patientNextCallScheduledTime);
        })
        .slice();
    } else {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(b.patientNextCallScheduledTime) - <any>new Date(a.patientNextCallScheduledTime);
        })
        .slice();
    }
  };
  public toggleAscDesc = function() {
    if (this.selectedSortFlag != 'desc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
    if (this.filterBy == 'call-date') {
      this.sortPatientsByCallDate(this.selectedSortFlag);
    } else {
      this.sortPatientsByDischargeDate(this.selectedSortFlag);
    }
  };

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }
}
