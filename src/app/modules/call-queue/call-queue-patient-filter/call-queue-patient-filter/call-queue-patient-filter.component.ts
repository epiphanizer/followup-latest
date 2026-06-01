import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { PatientCall, PatientCallService } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { DatePipe } from '@angular/common';

@Component({
  providers: [DatePipe],
  selector: 'app-call-queue-patient-filter[operation]',
  templateUrl: './call-queue-patient-filter.component.html',
  styleUrls: ['./call-queue-patient-filter.component.scss'],
  standalone: false
})
export class CallQueuePatientFilterComponent implements OnInit, OnChanges {
  @Input() operation: Operation;
  @Input() mode: any;
  @Input() filterDate: string;
  @Input() patientCalls: PatientCall[];
  patientCallsFiltered: PatientCall[] = [];

  constructor(private patientCallService: PatientCallService, private datePipe: DatePipe) {}

  private loadPatientCalls(): void {
    const patientCalls$ =
      this.mode?.spanish || !this.operation
        ? this.patientCallService.getSpanishSpeakingPatientCalls()
        : this.patientCallService.getPatientCallsByOperationId(this.operation.operationId);

    patientCalls$.subscribe((patientCalls: PatientCall[]) => {
      this.patientCalls = patientCalls || [];
      this.searchPatientCallHistoryBySelectedDate(this.filterDate);
    });
  }

  ngOnInit() {
    this.loadPatientCalls();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.patientCalls) {
      if (changes.filterDate) {
        this.filterDate = changes.filterDate.currentValue;
        this.searchPatientCallHistoryBySelectedDate(this.filterDate);
      }
    }

    if (changes.operation && !changes.operation.firstChange) {
      this.operation = changes.operation.currentValue;
      this.loadPatientCalls();
      return;
    }

    if (changes.mode && !changes.mode.firstChange) {
      this.mode = changes.mode.currentValue;
      this.loadPatientCalls();
    }
  }

  searchPatientCallHistoryBySelectedDate(selectedDate: string): PatientCall[] {
    let selectedDateObj = new Date(selectedDate);
    let transformedDate = this.datePipe.transform(selectedDateObj, 'yyyy-MM-dd');
    if (this.patientCalls) {
      this.patientCallsFiltered = this.patientCalls.filter((patientCall: PatientCall) => {
        if (patientCall.patientCallEndTime) {
          return patientCall.patientCallEndTime.toString().indexOf(transformedDate) !== -1;
        } else {
          return patientCall.patientCallScheduledTime.toString().indexOf(transformedDate) !== -1;
        }
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

  getPatientCallLink(patientCall: PatientCall): string {
    const operationId = patientCall?.patientOperationId || this.operation?.operationId;
    if (!operationId || !patientCall?.patientId) {
      return '/call-queue';
    }

    return '/call-queue/operations/' + operationId + '/patient/' + patientCall.patientId;
  }
}
