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
  @Input() mode: any;
  @Input() filterDate: string;
  @Input() patientCalls: PatientCall[];
  patientCallsFiltered: PatientCall[] = [];
  user: User;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  todaysDate: string;

  constructor(private patientCallService: PatientCallService, private datePipe: DatePipe) {}
  ngOnInit() {
    if (this.mode.spanish) {
      this.patientCallService.getSpanishSpeakingPatientCalls().subscribe((patientCalls: PatientCall[]) => {
        if (!patientCalls) {
          this.patientCalls = [];
        }
        this.patientCalls = patientCalls;
        this.searchPatientCallHistoryBySelectedDate(this.filterDate);
      });
    } else {
      if (this.operation) {
        this.patientCallService
          .getPatientCallsByOperationId(this.operation.operationId)
          .subscribe((patientCalls: PatientCall[]) => {
            if (!patientCalls) {
              this.patientCalls = [];
            }
            this.patientCalls = patientCalls;
            this.searchPatientCallHistoryBySelectedDate(this.filterDate);
          });
      } else {
        // spanish speaking won't have a specific operation tied to it
        this.patientCallService.getSpanishSpeakingPatientCalls().subscribe((patientCalls: PatientCall[]) => {
          if (!patientCalls) {
            this.patientCalls = [];
          }
          this.patientCalls = patientCalls;
          this.searchPatientCallHistoryBySelectedDate(this.filterDate);
        });
      }
    }
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
            if (!patientCalls) {
              this.patientCalls = [];
            }
            this.patientCalls = patientCalls;
            this.searchPatientCallHistoryBySelectedDate(this.filterDate);
          });
      }
    }
  }

  searchPatientCallHistoryBySelectedDate(selectedDate: string): PatientCall[] {
    const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();
    const transformedDate = this.datePipe.transform(selectedDateObj, 'yyyy-MM-dd');
    if (this.patientCalls) {
      this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
        const endedDate = patientCall.patientCallEndTime
          ? this.datePipe.transform(new Date(patientCall.patientCallEndTime), 'yyyy-MM-dd')
          : null;
        const scheduledDate = patientCall.patientCallScheduledTime
          ? this.datePipe.transform(new Date(patientCall.patientCallScheduledTime), 'yyyy-MM-dd')
          : null;

        if (endedDate) {
          return endedDate === transformedDate;
        }

        if (!scheduledDate) {
          return false;
        }

        if (this.mode?.spanish) {
          // Spanish history should include upcoming scheduled calls from the selected day forward.
          return scheduledDate >= transformedDate;
        }

        return scheduledDate === transformedDate;
      });
    }
    return this.patientCallsFiltered;
  }
  searchPatientCallHistoryByText($event: KeyboardEvent): PatientCall[] {
    const target = $event.currentTarget as HTMLInputElement | null;
    let searchText = (target?.value || '').toLowerCase();
    this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
      let patientFullName = patientCall.patientFirstName + ' ' + patientCall.patientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.patientCallsFiltered;
  }
}
