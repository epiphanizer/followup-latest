import { Component, OnInit } from '@angular/core';
import { PatientCallService } from '../../patient-call/patient-call.service';

@Component({
  selector: 'app-patient-call-history-listing',
  templateUrl: './patient-call-history-listing.component.html',
  styleUrls: ['./patient-call-history-listing.component.scss']
})
export class PatientCallHistoryListingComponent implements OnInit {
  patientCalls: [];
  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}
}
