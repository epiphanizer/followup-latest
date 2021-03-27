import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Notification, NotificationRecipient, NotificationType } from '@app/modules/notification/notification';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OperationContact } from '@app/modules/operation/operation-contact/operation-contact';
import { OperationContactsService } from '@app/modules/operation/operation-contacts.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  providers: [NotificationService, ToastrService],
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  createNotificationForm: FormGroup;
  notification: Notification;
  notificationRecipients: NotificationRecipient[];
  notificationType: NotificationType;
  notificationTypes: NotificationType[];
  notificationTypesListLeft: NotificationType[] = [];
  notificationTypesListRight: NotificationType[] = [];
  operationContacts$: Observable<OperationContact[]>;
  notificationRecipients$: Observable<NotificationRecipient[]>;
  status: {
    notification: {
      saved: boolean;
    };
  } = {
    notification: {
      saved: false
    }
  };
  todaysDate: string;
  todaysDateDay: number;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private operationContactsService: OperationContactsService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.notificationService.getNotificationTypes().subscribe((data: any) => {
      this.notificationTypes = data;
      this.createForm();
      this.onChanges();
      this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    });
    this.operationContacts$ = this.operationContactsService.getOperationContactsByOperationId(
      this.notification.notificationOperationId
    );
  }
  onChanges() {
    let notificationTypes = this.notificationTypes;
    if (this.createNotificationForm) {
      this.createNotificationForm.get('notificationTypeId').valueChanges.subscribe(val => {
        this.notificationType = notificationTypes.find(
          notificationTypes => notificationTypes.notificationTypeId == val
        );
        if (this.notificationType !== undefined) {
          this.notification.notificationTypeId = this.notificationType.notificationTypeId;
          this.notification.notificationTypeLabel = this.notificationType.notificationTypeLabel;
          this.notification.notificationIconImage = this.notificationType.notificationIconImage;
        }
      });
      this.createNotificationForm.get('notificationMessage').valueChanges.subscribe(val => {
        this.notification.notificationMessage = encodeURI(val);
      });
    }
  }

  createForm() {
    this.createNotificationForm = this.fb.group({
      notificationTypeId: this.fb.control(false, [Validators.required]),
      notificationMessage: this.fb.control('', [Validators.required])
    });
  }
  editNotification() {
    this.status.notification.saved = false;
  }
  saveNotification() {
    this.status.notification.saved = true;
    this.notificationService
      .getNotificationRecipientsByOperationIdAndNotificationTypeId(
        this.notification.notificationOperationId,
        this.notification.notificationTypeId
      )
      .subscribe((data: NotificationRecipient[]) => {
        if (data !== null) {
          this.notificationRecipients = data;
        } else {
          alert('No notification recipients are configured, please configure notification recipients');
          this.status.notification.saved = false;
          return;
        }
      });
  }
  sendTheNotification() {
    let formData = this.createNotificationForm.getRawValue();
    this.notification.notificationTypeId = parseInt(formData.notificationTypeId);

    this.notification.notificationMessage = formData.notificationMessage;
    this.notificationService
      .addNotificationByOperationIdAndNotificationTypeId(this.notification)
      .subscribe((data: any) => {
        let notificationId = data.notificationId;
        /**
         * If successful, actually email out the notification
         */
        this.notificationService.sendNotificationByNotificationId(notificationId).subscribe(() => {
          this.toastr.success('Successfully sent notification!');
        });
        this.dismiss();
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
