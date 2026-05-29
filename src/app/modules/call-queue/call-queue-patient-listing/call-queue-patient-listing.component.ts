import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  providers: [PatientService],
  selector: 'app-call-queue-patient-listing[operation]',
  templateUrl: './call-queue-patient-listing.component.html',
  styleUrls: ['./call-queue-patient-listing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class CallQueuePatientListingComponent implements OnInit, OnChanges {
  @Input() mode: any;
  @Input() spanishListing: boolean;
  pageOfItems: Patient[];
  currentYear: number;
  spanishPatientsCount: number;
  todaysCallCount: number;
  @Input() operation: Operation;
  // we default to filtering by next call-date
  colDefs: string[] = ['Call Date', 'Discharge Date'];
  public patients: Patient[];
  public patients$: Observable<Patient[]> | void = null;
  public todaysDate: Date;
  public selectedSortFlag: string = 'asc';
  public selectedSortOption: string = this.colDefs[0];

  constructor(private patientService: PatientService) {}
  ngOnInit() {
    this.todaysDate = new Date();
    this.currentYear = new Date().getFullYear();
    if (this.mode.spanish) {
      this.patients$ = this.patientService.getActiveSpanishPatients().pipe(
        take(1),
        map((patients: Patient[]) => {
          if (patients) {
            this.patients = patients;
            this.spanishPatientsCount = this.patients.length;
            this.runSortSwitch();
          } else {
            this.patients = [];
          }
          return patients;
        })
      );
    } else {
      if (!this.operation || !this.operation.operationId) {
        this.patients = [];
        this.patients$ = of([]);
        return;
      }
      this.patients$ = this.patientService.getActivePatientListByOperationId(this.operation.operationId).pipe(
        take(1),
        map((patients: Patient[]) => {
          this.patients = patients;
          if (patients) {
            this.runSortSwitch();
          }
          return patients;
        })
      );
    }
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      if (!changes.operation.firstChange) {
        this.operation = changes.operation.currentValue;
        if (!this.operation || !this.operation.operationId) {
          this.patients = [];
          this.patients$ = of([]);
          return;
        }
        this.patients$ = this.patientService.getActivePatientListByOperationId(this.operation.operationId).pipe(
          map((patients: Patient[]) => {
            this.patients = patients;
            if (patients) {
              this.runSortSwitch();
            } else {
            }
            return patients;
          })
        );
      }
    }
  }

  public checkDateGreaterThanEqualToToday(patientNextCallScheduledTime: string) {
    let patientNextCallDateObj = new Date(patientNextCallScheduledTime);
    if (patientNextCallDateObj <= this.todaysDate) {
      return true;
    } else {
      return false;
    }
  }
  sortOptionSelected($event: string) {
    this.selectedSortOption = $event;
    this.runSortSwitch();
  }
  public sortPatientsByDischargeDate = function() {
    if (this.selectedSortFlag == 'asc') {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(a.patientDischargeDate) - <any>new Date(b.patientDischargeDate);
        })
        .slice();
    } else {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(b.patientDischargeDate) - <any>new Date(a.patientDischargeDate);
        })
        .slice();
    }
  };
  public sortPatientsByCallDate = function() {
    if (this.selectedSortFlag == 'asc') {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(a.patientNextCallScheduledTime) - <any>new Date(b.patientNextCallScheduledTime);
        })
        .slice();
    } else {
      this.patients = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(b.patientNextCallScheduledTime) - <any>new Date(a.patientNextCallScheduledTime);
        })
        .slice();
    }
  };
  public toggleAscDesc = function($event: string) {
    this.selectedSortFlag = $event;
    this.runSortSwitch();
  };

  trackByPatientId(index: number, patient: Patient): string | number {
    return patient?.patientId ?? index;
  }

  runSortSwitch() {
    switch (this.selectedSortOption) {
      case 'Discharge Date':
        this.sortPatientsByDischargeDate();
        break;
      case 'Call Date':
        this.sortPatientsByCallDate();
        break;
    }
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }
}
