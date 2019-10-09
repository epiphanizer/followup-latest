import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { PatientCall, PatientCallService } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [AuthenticationService, PatientService, UserService],
  selector: 'app-call-queue-patient-filter[operation]',
  templateUrl: './call-queue-patient-filter.component.html',
  styleUrls: ['./call-queue-patient-filter.component.scss']
})
export class CallQueuePatientFilterComponent implements OnInit {
  @Input() operation: Operation;
  @Input() filterDate: string;
  @Input() patientCalls: PatientCall[];
  patientCallsFiltered: PatientCall[] = [];
  user: User;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  constructor(private patientCallService: PatientCallService, private route: ActivatedRoute) {}
  ngOnInit() {
    this.patientCallService
      .getPatientCallsByOperationId(this.operation.operationId)
      .subscribe((patientCalls: PatientCall[]) => {
        if (!patientCalls.length) {
          this.patientCalls = [];
        }
        this.patientCalls = patientCalls;
        this.searchPatientCallHistoryBySelectedDate(this.filterDate);
      });
  }
  searchPatientCallHistoryBySelectedDate(selectedDate: string): PatientCall[] {
    let selectedDateObj = new Date(selectedDate);
    this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
      return (
        patientCall.patientCallScheduledTime == selectedDateObj || patientCall.patientCallEndTime == selectedDateObj
      );
    });
    return this.patientCallsFiltered;
  }
  searchPatientCallHistoryByText($event: KeyboardEvent): PatientCall[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
      return (
        patientCall.patientFirstName.toLowerCase().includes(searchText) ||
        patientCall.patientLastName.toLowerCase().includes(searchText)
      );
    });
    return this.patientCallsFiltered;
  }
}
