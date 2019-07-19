import { Component, OnInit } from '@angular/core';
import { PatientService } from '@app/modules/patient/patient.service.ts';
import { Observable } from 'rxjs';

@Component({
  providers: [PatientService],
  selector: 'app-call-queue-patient-listing',
  templateUrl: './call-queue-patient-listing.component.html',
  styleUrls: ['./call-queue-patient-listing.component.scss']
})
export class CallQueuePatientListingComponent implements OnInit {
  patientService: PatientService;
  selectedOperation: number;
  constructor(patientService: PatientService) {
    this.patientService = patientService;
  }
  public patients$: Observable<any> | void = null;
  ngOnInit() {
    /**
     * Get the operation from the route.
     */
    this.selectedOperation = 1;
    this.patients$ = this.patientService.getPatientListByOperationId(1);
  }

  public sortPatientsByCallDate = function() {};
  public sortPatientsByDischargeDate = function() {};
  public toggleAscDesc = function() {};
  public toggleOperationSidebarMenu = function() {};
}
