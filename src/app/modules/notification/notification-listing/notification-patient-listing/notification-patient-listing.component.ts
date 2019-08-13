import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation.service';
import { Patient, PatientService } from '@app/modules/patient/patient.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-notification-patient-listing',
  templateUrl: './notification-patient-listing.component.html',
  styleUrls: ['./notification-patient-listing.component.scss']
})
export class NotificationPatientListingComponent implements OnInit {
  @Input() operation: Operation;
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  constructor(private patientService: PatientService) {}
  ngOnInit() {
    this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
      map((patients: [Patient]) => {
        return patients;
      })
    );
  }

  /**
   * Our sorter functions
   */
  toggleAscDesc() {
    alert('Toggled ascending vs. descending');
  }
  sortNotificationsByDate() {}
  sortNotificationsByType() {}
  sortNotificationsByStatus() {}
}
