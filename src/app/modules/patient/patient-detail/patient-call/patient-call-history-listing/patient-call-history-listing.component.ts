import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCallService, PatientCall } from '../../patient-call/patient-call.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-call-history-listing',
  templateUrl: './patient-call-history-listing.component.html',
  styleUrls: ['./patient-call-history-listing.component.scss']
})
export class PatientCallHistoryListingComponent implements OnInit {
  @Input() patient: Patient;
  patientCalls: PatientCall[];
  constructor() {}

  ngOnInit() {
    this.patient.patientCalls$.subscribe((data: PatientCall[]) => {
      this.patientCalls = data;
    });
  }
}
