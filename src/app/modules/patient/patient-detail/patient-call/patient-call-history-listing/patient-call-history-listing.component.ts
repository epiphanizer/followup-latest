import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCallService, PatientCall, PatientCallQuestion } from '../../patient-call/patient-call.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-call-history-listing',
  templateUrl: './patient-call-history-listing.component.html',
  styleUrls: ['./patient-call-history-listing.component.scss']
})
export class PatientCallHistoryListingComponent implements OnInit {
  @Input() patientCalls: PatientCall[];
  patientCallQuestions: PatientCallQuestion[] = [];

  constructor() {}

  ngOnInit() {
    // need a loop to push the patient call questions onto the array
    let mock = {
      patientCallQuestionId: 9,
      patientCallId: 10,
      patientCallQuestion: 'Patient Call Question 1',
      patientCallLabel: 'Short Label'
    };
    // this.patientCalls.map()
    this.patientCallQuestions.push(mock);
  }
}
