import { Component, OnInit } from '@angular/core';
import { Notification, NotificationReply } from '../notification';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { NotificationService } from '../notification.service';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { SharedFunctions } from '@app/shared/shared.functions';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '@app/core/authentication/auth.service';
@Component({
  providers: [SharedFunctions, NotificationService, ToastrService],
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
  standalone: false
})
export class NotificationDetailComponent implements OnInit {
  notification!: Notification;
  notificationDecoded: string = '';
  patient!: Patient;
  notificationReplies: NotificationReply[] = [];
  replyForm!: FormGroup;
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
    private notificationService: NotificationService,
    private sharedFunctions: SharedFunctions,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.notification = this.route.snapshot.data.notification;
    this.notification.notificationMessage = this.sharedFunctions.returnHTML(this.notification.notificationMessage);
    this.createReplyForm();
    this.patientService
      .getPatientByPatientId(this.notification.notificationPatientId)
      .subscribe((patient: Patient | Patient[]) => {
        const patientRecord = Array.isArray(patient) ? patient[0] : patient;
        this.patient = patientRecord;
      });
    // Load replies for this notification
    this.loadNotificationReplies();
  }

  createReplyForm() {
    this.replyForm = this.fb.group({
      replyText: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  loadNotificationReplies() {
    var notificationId = this.notification.notificationId;

    if (!notificationId) {
      this.notificationReplies = [];
      return;
    }

    this.notificationService.getNotificationRepliesByNotificationId(notificationId).subscribe(
      (replies: NotificationReply[]) => {
        this.notificationReplies = replies;
      },
      error => {
        console.error('Error loading notification replies', error);
      }
    );
  }

  submitReply() {
    if (this.replyForm.invalid) {
      return;
    }

    const currentUser = this.authService.currentUserValue;
    const notificationId = this.notification.notificationId;
    const replyTextControl = this.replyForm.get('replyText');

    if (!notificationId || !replyTextControl) {
      return;
    }

    const replyBody = {
      userId: currentUser.userId,
      replyText: replyTextControl.value
    };

    this.notificationService
      .addNotificationReply(
        notificationId,
        this.notification.notificationPatientId,
        this.notification.notificationOperationId,
        replyBody
      )
      .subscribe(
        () => {
          this.toastr.success('Reply submitted successfully');
          this.replyForm.reset();
          this.loadNotificationReplies();
        },
        error => {
          this.toastr.error('Error submitting reply');
          console.error('Error submitting reply', error);
        }
      );
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
