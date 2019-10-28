import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';

@Component({
  selector: 'app-patient-patient-listing',
  templateUrl: './patient-patient-listing.component.html',
  styleUrls: ['./patient-patient-listing.component.scss']
})
export class PatientPatientListingComponent implements OnInit {
  @Input() operation: Operation;
  public patients: Patient[];
  public patients$: Observable<Patient[]>;
  public filterBy: string = 'discharge-date';
  public selectedSortFlag: string = 'desc';

  constructor(private patientService: PatientService) {}
  ngOnInit() {
    this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
      map((patients: Patient[]) => {
        this.patients = patients;
        return patients;
      })
    );
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.patients = [];
      this.operation = changes.operation.currentValue;
      this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
        map((patients: Patient[]) => {
          this.patients = patients;
          return patients;
        })
      );
    }
  }
  public sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'notification-date';
    if (sortFlag == 'asc') {
      // this.notifications.sort((a: Notification, b: Notification) => {
      //   return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
      // });
    } else {
      // this.notifications.sort((a: Notification, b: Notification) => {
      //   return <any>new Date(b.notificationCreatedDate) - <any>new Date(a.notificationCreatedDate);
      // });
    }
  };

  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
  }
  sortNotificationsByNotificationType = function(sortFlag: string) {
    this.filterBy = 'notification-type';
    // if (this.selectedSortFlag == 'asc') {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
    //   });
    // } else {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) + <any>new Date(b.notificationCreatedDate);
    //   });
    // }
  };
  sortNotificationsByPatient = function(sortFlag: string) {
    this.filterBy = 'patient';
    // if (this.selectedSortFlag == 'asc') {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
    //   });
    // } else {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) + <any>new Date(b.notificationCreatedDate);
    //   });
    // }
  };
}
