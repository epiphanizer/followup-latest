import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Notification, NotificationRecipient, NotificationType } from '@app/modules/notification/notification';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { OperationContact } from '@app/modules/operation/operation-contact/operation-contact';
import { OperationContactsService } from '@app/modules/operation/operation-contacts.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  providers: [ToastrService],
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss'],
  standalone: false
})
export class NotificationModalComponent {
  createNotificationForm: FormGroup;
  @Input() notification: Notification;
  notificationRecipients: NotificationRecipient[];
  notificationType: NotificationType;
  notificationTypes: NotificationType[] = [];
  notificationTypesListLeft: NotificationType[] = [];
  notificationTypesListRight: NotificationType[] = [];
  operationContacts$: Observable<OperationContact[]>;
  notificationRecipients$: Observable<NotificationRecipient[]>;
  notificationTypesLoading: boolean = true;
  notificationTypesError: string | null = null;
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
    private toastr: ToastrService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.notification = this.buildSafeNotification(this.notification);
    this.createForm();
    this.onChanges();
    this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');

    this.notificationService
      .getNotificationTypes()
      .pipe(take(1))
      .subscribe({
        next: (data: NotificationType[] | { data?: NotificationType[]; notificationTypes?: NotificationType[] } | null) => {
          this.notificationTypes = this.normalizeNotificationTypes(data);
          this.notificationTypesLoading = false;
          this.notificationTypesError = null;
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.notificationTypes = [];
          this.notificationTypesLoading = false;
          this.notificationTypesError = 'Unable to load notification options.';
          this.changeDetectorRef.detectChanges();
        }
      });

    this.operationContacts$ = this.notification.notificationOperationId
      ? this.operationContactsService.getOperationContactsByOperationId(this.notification.notificationOperationId)
      : of([]);
  }
  onChanges() {
    if (this.createNotificationForm) {
      this.createNotificationForm.get('notificationTypeId').valueChanges.subscribe(val => {
        this.notificationType = this.notificationTypes.find(
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
    this.notification.notificationTypeId = formData.notificationTypeId;

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

  private buildSafeNotification(notification?: Notification | null): Notification {
    return {
      notificationCreatedByUserId: notification?.notificationCreatedByUserId || '',
      notificationMessage: notification?.notificationMessage || '',
      notificationOperationId: notification?.notificationOperationId || '',
      notificationPatientId: notification?.notificationPatientId || '',
      notificationTypeId: notification?.notificationTypeId || '',
      notificationTypeLabel: notification?.notificationTypeLabel || '',
      notificationIconImage: notification?.notificationIconImage || '',
      notificationOperationName: notification?.notificationOperationName || '',
      notificationPatientFirstName: notification?.notificationPatientFirstName || '',
      notificationPatientLastName: notification?.notificationPatientLastName || '',
      notificationPatientMedicalRecordNumber: notification?.notificationPatientMedicalRecordNumber || undefined
    };
  }

  private normalizeNotificationTypes(
    response: NotificationType[] | { data?: NotificationType[]; notificationTypes?: NotificationType[] } | null
  ): NotificationType[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.notificationTypes)) {
      return response.notificationTypes;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }
}
