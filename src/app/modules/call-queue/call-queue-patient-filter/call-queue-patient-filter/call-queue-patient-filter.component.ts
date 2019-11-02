import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { PatientCall, PatientCallService } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { DatePipe } from '@angular/common';

@Component({
  providers: [AuthenticationService, DatePipe, PatientService, UserService],
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
  todaysDate: string;

  constructor(private patientCallService: PatientCallService, private datePipe: DatePipe) {}
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
  ngOnChanges(changes: SimpleChanges) {
    if (this.patientCalls) {
      if (changes.filterDate) {
        this.filterDate = changes.filterDate.currentValue;
        this.searchPatientCallHistoryBySelectedDate(this.filterDate);
      }
    }
    if (this.operation) {
      if (changes.operation) {
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
    }
  }

  searchPatientCallHistoryBySelectedDate(selectedDate: string): PatientCall[] {
    let selectedDateObj = new Date(selectedDate);
    let transformedDate = this.datePipe.transform(selectedDateObj, 'yyyy-MM-dd');
    this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
      return patientCall.patientCallScheduledTime.toString().indexOf(transformedDate) !== -1;
    });
    return this.patientCallsFiltered;
  }
  searchPatientCallHistoryByText($event: KeyboardEvent): PatientCall[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
      let patientFullName = patientCall.patientFirstName + ' ' + patientCall.patientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.patientCallsFiltered;
  }
}
