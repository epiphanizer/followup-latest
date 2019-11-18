import { Component, Input, OnInit } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  currentYear: number;
  currentNewDischargeCount: number;
  @Input() operation: Operation;
  // we default to filtering by next call-date
  filterBy: string = 'call-date';
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
      map((patients: Patient[]) => {
        this.patients = patients;
        this.getCurrentNewDischargeCount(patients);
        this.sortPatientsByCallDate(this.selectedSortFlag);
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
            this.getCurrentNewDischargeCount(patients);
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
    patientsWithNoCalls = patients.filter(function(patient: Patient) {
      return patient.patientCallCount - 1 == 0;
    });
    this.currentNewDischargeCount = patientsWithNoCalls.length;
  }
  public sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'discharge-date';
    if (sortFlag == 'asc') {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientDischargeDate) - <any>new Date(b.patientDischargeDate);
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(b.patientDischargeDate) - <any>new Date(a.patientDischargeDate);
      });
    }
  };
  public sortPatientsByCallDate = function(sortFlag: string) {
    this.filterBy = 'call-date';
    if (sortFlag == 'asc') {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientNextCallScheduledTime) - <any>new Date(b.patientNextCallScheduledTime);
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(b.patientNextCallScheduledTime) - <any>new Date(a.patientNextCallScheduledTime);
      });
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
}
