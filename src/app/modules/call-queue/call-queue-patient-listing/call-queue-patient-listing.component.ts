import { Component, Input, OnInit } from '@angular/core';
import { Operation, OperationService } from '@app/modules/operation/operation.service.ts';
import { PatientService, Patient } from '@app/modules/patient/patient.service.ts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  providers: [PatientService],
  selector: 'app-call-queue-patient-listing',
  templateUrl: './call-queue-patient-listing.component.html',
  styleUrls: ['./call-queue-patient-listing.component.scss']
})
export class CallQueuePatientListingComponent implements OnInit {
  @Input() operationId: number;
  operation: Operation;
  public operation$: Observable<Operation>;
  public patients$: Observable<[Patient]> | void = null;
  constructor(private patientService: PatientService, private operationService: OperationService) {}
  ngOnInit() {
    /**
     * Get the operation from the route.
     */
    this.operation$ = this.operationService.getOperationByOperationId(this.operationId).pipe(
      map((operation: Operation) => {
        this.operation = operation;
        return operation;
      })
    );
    this.patients$ = this.patientService.getPatientListByOperationId(this.operationId).pipe(
      map((patients: [Patient]) => {
        return patients;
      })
    );
  }

  public sortPatientsByCallDate = function() {};
  public sortPatientsByDischargeDate = function() {};
  public toggleAscDesc = function() {};
  public toggleOperationSidebarMenu = function() {};
}
