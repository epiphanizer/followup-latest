import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-call-queue-patient-listing',
  templateUrl: './call-queue-patient-listing.component.html',
  styleUrls: ['./call-queue-patient-listing.component.scss']
})
export class CallQueuePatientListingComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  public sortPatientsByCallDate = function() {};
  public sortPatientsByDischargeDate = function() {};
  public toggleOperationSidebarMenu = function() {};
}
