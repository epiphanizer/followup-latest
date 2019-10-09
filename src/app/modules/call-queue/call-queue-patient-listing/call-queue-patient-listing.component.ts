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
  @Input() operation: Operation;

  filterBy: string;
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  public patientCallStatuses: PatientCallStatus[];
  public selectedSortFlag: string;

  constructor(private patientService: PatientService, private patientCallStatusService: PatientCallStatusService) {}
  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.patientCallStatusService.getPatientCallStatuses().subscribe((patientCallStatuses: PatientCallStatus[]) => {
      console.log(patientCallStatuses);
      this.patientCallStatuses = patientCallStatuses;
    });
    this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
      map((patients: [Patient]) => {
        this.patients = patients;
        return patients;
      })
    );
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      if (!changes.operation.firstChange) {
        this.operation = changes.operation.currentValue;
        this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
          map((patients: [Patient]) => {
            this.patients = patients;
            return patients;
          })
        );
      }
    }
  }

  public sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'discharge-date';
    if (sortFlag == 'asc') {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientDischargeDate) - <any>new Date(b.patientDischargeDate);
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientDischargeDate) + <any>new Date(b.patientDischargeDate);
      });
    }
  };

  public sortPatientsByCallDate = function(sortFlag: string) {
    this.filterBy = 'call-date';
    if (sortFlag == 'asc') {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientNextCallTime) - <any>new Date(b.patientNextCallTime);
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientNextCallTime) + <any>new Date(b.patientNextCallTime);
      });
    }
  };
  public toggleAscDesc = function() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
  };
}
