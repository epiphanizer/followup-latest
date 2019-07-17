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
  constructor(patientService: PatientService) {}
  private $patients: Observable<any> | null = null;
  ngOnInit() {}

  public sortPatientsByCallDate = function() {};
  public sortPatientsByDischargeDate = function() {};
  public toggleAscDesc = function() {};
  public toggleOperationSidebarMenu = function() {};
}
