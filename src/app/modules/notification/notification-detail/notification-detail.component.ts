import { Component, OnInit } from '@angular/core';
import { Notification } from '../notification';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { SharedFunctions } from '@app/shared/shared.functions';
@Component({
  providers: [SharedFunctions],
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss']
})
export class NotificationDetailComponent implements OnInit {
  notification: Notification;
  notificationDecoded: string;
  patient: Patient;
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private sharedFunctions: SharedFunctions
  ) {}

  ngOnInit() {
    this.notification = this.route.snapshot.data.notification;
    this.notification.notificationMessage = this.sharedFunctions.returnHTML(this.notification.notificationMessage);
    this.patientService.getPatientByPatientId(this.notification.notificationPatientId).subscribe((patient: Patient) => {
      this.patient = patient[0];
    });
  }
  operationChangeEventHandler($event: Operation) {
    if (!this.selected.operation) {
      this.selected.operation = $event;
    } else {
      this.selected.operation = $event;
      window.location.href = '/operations/' + this.selected.operation.operationId + '/notifications';
    }
  }
}
