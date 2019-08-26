import { Component, Input, OnInit } from '@angular/core';
import { Operation } from '@app/modules/operation/operation.service.ts';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service.ts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  providers: [PatientService],
  selector: 'app-call-queue-patient-listing[operation]',
  templateUrl: './call-queue-patient-listing.component.html',
  styleUrls: ['./call-queue-patient-listing.component.scss']
})
export class CallQueuePatientListingComponent implements OnInit {
  currentYear: number;
  @Input() operation: Operation;
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  constructor(private patientService: PatientService) {}
  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
      map((patients: [Patient]) => {
        return patients;
      })
    );
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.operation = changes.operation.currentValue;
      this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
        map((patients: [Patient]) => {
          this.patients = patients;
          return patients;
        })
      );
    }
  }
  public sortPatientsByCallDate = function() {};
  public sortPatientsByDischargeDate = function() {};
  public toggleAscDesc = function() {};
}
