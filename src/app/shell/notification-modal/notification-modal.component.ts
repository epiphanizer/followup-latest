import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Notification, NotificationRecipient, NotificationType } from '@app/modules/notification/notification';
import { NotificationRecipientService } from '@app/modules/notification/notification-recipient/notification-recipient.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { OperationContact } from '@app/modules/operation/operation-contact/operation-contact';
import { OperationContactsService } from '@app/modules/operation/operation-contacts.service';
@Component({
  providers: [NotificationService],
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  createNotificationForm: FormGroup;
  notification: Notification;
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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.notificationService.getNotificationTypes().subscribe((data: any) => {
      this.notificationTypes = data;
      var i;
      for (i = 0; i <= this.notificationTypes.length; i = i + 2) {
        if (this.notificationTypes[i] !== undefined) {
          if (
            this.notificationTypes[i].notificationTypeLabel !== 'Kudos' &&
            this.notificationTypes[i + 1].notificationTypeLabel !== 'Kudos'
          ) {
            this.notificationTypesListLeft.push(this.notificationTypes[i]);
          }
          if (
            this.notificationTypes[i + 1] !== undefined &&
            this.notificationTypes[i + 1].notificationTypeLabel !== 'Kudos'
          ) {
            this.notificationTypesListRight.push(this.notificationTypes[i + 1]);
          }
        }
      }
      this.createForm();
      this.onChanges();
      this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
      this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    });
    this.operationContacts$ = this.operationContactsService.getOperationContactsByOperationId(
      this.notification.notificationOperationId
    );
  }
  onChanges() {
    let notificationTypes = this.notificationTypes;
    this.createNotificationForm.get('notificationTypeId').valueChanges.subscribe(val => {
      this.notificationType = notificationTypes.find(notificationTypes => notificationTypes.notificationTypeId == val);
      if (this.notificationType! == undefined) {
        this.notification.notificationTypeLabel = this.notificationType.notificationTypeLabel;
        this.notification.notificationIconImage = this.notificationType.notificationIconImage;
      }
    });
    this.createNotificationForm.get('notificationMessage').valueChanges.subscribe(val => {
      this.notification.notificationMessage = val;
    });
    this.createNotificationForm.get('notificationTypeId').valueChanges.subscribe(val => {
      this.notification.notificationTypeId = val;
      this.notificationService
        .getNotificationRecipientsByOperationIdAndNotificationTypeId(
          this.notification.notificationOperationId,
          this.notification.notificationTypeId
        )
        .subscribe((data: any) => {
          console.log(data);
          debugger;
        });
    });
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
  }
  sendTheNotification() {
    let formData = this.createNotificationForm.getRawValue();
    this.notification.notificationTypeId = parseInt(formData.notificationTypeId);
    this.notification.notificationMessage = formData.notificationMessage;
    this.notificationService
      .addNotificationByOperationIdAndNotificationTypeId(this.notification)
      .subscribe((data: any) => {
        this.dismiss();
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
