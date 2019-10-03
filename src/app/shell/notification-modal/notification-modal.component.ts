import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Patient } from '@app/modules/patient/patient';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Notification, NotificationRecipient } from '@app/modules/notification/notification';
import { NotificationRecipientService } from '@app/modules/notification/notification-recipient/notification-recipient.service';
import { ActivatedRoute } from '@angular/router';
import { Operation } from '@app/modules/operation/operation.service';
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
  notificationTypes: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  }[] = [];
  notificationTypesListLeft: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  }[] = [];
  notificationTypesListRight: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  }[] = [];
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
          this.notificationTypesListLeft.push(this.notificationTypes[i]);
          this.notificationTypesListRight.push(this.notificationTypes[i + 1]);
        }
      }
      this.todaysDate = formatDate(new Date(), 'yyyy-mm-dd', 'en');
      this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
      this.createNotification();
      this.createForm();
      this.onChanges();
    });
    this.operationContacts$ = this.operationContactsService.getOperationContactsByOperationId(
      this.notification.notificationOperationId
    );
  }
  onChanges() {
    this.createNotificationForm.get('notificationTypeId').valueChanges.subscribe(val => {
      this.notification.notificationTypeId = val;
      this.notification.notificationTypeLabel = 'Label applied from selecting type';
    });
    this.createNotificationForm.get('notificationMessage').valueChanges.subscribe(val => {
      this.notification.notificationMessage = val;
    });
  }
  ngAfterViewInit() {}
  createForm() {
    this.createNotificationForm = this.fb.group({
      notificationTypeId: this.fb.control(false, [Validators.required]),
      notificationMessage: this.fb.control('', [Validators.required])
    });
  }
  createNotification() {
    return (this.notification = {
      notificationTypeId: 0,
      notificationTypeLabel: 'Notification',
      notificationPatientId: 0,
      notificationOperationId: 0,
      notificationMessage: ''
    });
  }
  editNotification() {
    this.status.notification.saved = false;
  }
  saveNotification() {
    this.status.notification.saved = true;
  }
  sendNotification() {
    let formData = this.createNotificationForm.getRawValue();
    this.notification.notificationTypeId = formData.notificationTypeId;
    this.notification.notificationMessage = formData.notificationMessage;
    this.notificationService
      .addNotificationByOperationIdAndNotificationTypeId(this.notification)
      .subscribe((data: any) => {
        console.log(data);
        this.dismiss();
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
