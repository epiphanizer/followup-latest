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
  currentUserId: string = '';
  isReplyModalOpen: boolean = false;
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
    this.currentUserId = this.route.snapshot.data.user?.userId || '';
    this.notification.notificationMessage = this.sharedFunctions.returnHTML(this.notification.notificationMessage);
    this.patientService
      .getPatientByPatientId(this.notification.notificationPatientId)
      .subscribe((patient: Patient | Patient[]) => {
        const patientRecord = Array.isArray(patient) ? patient[0] : patient;
        this.patient = patientRecord;
      });
  }

  get replyOperation(): { operationId: string; operationGroupName: string } {
    return {
      operationId: this.notification?.notificationOperationId || this.patient?.patientOperationId,
      operationGroupName: this.patient?.patientOperationName || this.notification?.notificationOperationName
    };
  }

  openReplyModal(): void {
    if (!this.notification?.notificationId || !this.patient?.patientId || !this.currentUserId) {
      return;
    }

    this.isReplyModalOpen = true;
  }

  onReplySubmitted(): void {
    this.isReplyModalOpen = false;
  }

  closeReplyModal(): void {
    this.isReplyModalOpen = false;
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
