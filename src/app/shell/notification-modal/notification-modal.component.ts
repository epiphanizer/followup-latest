import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Notification, NotificationRecipient, NotificationType } from '@app/modules/notification/notification';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { finalize, map, shareReplay, take, tap } from 'rxjs/operators';
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
  private createdNotificationId: string | null = null;
  notificationRecipients: NotificationRecipient[] = [];
  notificationType: NotificationType;
  notificationTypes: NotificationType[] = [];
  notificationTypesListLeft: NotificationType[] = [];
  notificationTypesListRight: NotificationType[] = [];
  operationContacts$: Observable<OperationContact[]>;
  notificationRecipients$: Observable<NotificationRecipient[]>;
  notificationTypesLoading: boolean = true;
  notificationTypesError: string | null = null;
  notificationRecipientsLoading: boolean = false;
  private notificationRecipientCache = new Map<string, NotificationRecipient[]>();
  private notificationRecipientRequests = new Map<string, Observable<NotificationRecipient[]>>();
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
          this.primeNotificationRecipients(this.notification.notificationTypeId);
        } else {
          this.notification.notificationTypeId = '';
          this.notification.notificationTypeLabel = '';
          this.notification.notificationIconImage = '';
        }
      });
      this.createNotificationForm.get('notificationMessage').valueChanges.subscribe(val => {
        this.notification.notificationMessage = val || '';
      });
    }
  }

  createForm() {
    this.createNotificationForm = this.fb.group({
      notificationTypeId: this.fb.control(null, [Validators.required]),
      notificationMessage: this.fb.control('', [Validators.required])
    });
  }
  editNotification() {
    if (this.notificationRecipientsLoading) {
      return;
    }

    this.status.notification.saved = false;
  }

  saveNotification() {
    this.syncNotificationFromForm();

    if (this.notificationRecipientsLoading) {
      return;
    }

    if (this.createNotificationForm.invalid) {
      this.createNotificationForm.markAllAsTouched();
      this.status.notification.saved = false;
      return;
    }

    if (!this.notification.notificationOperationId) {
      this.notificationRecipients = [];
      this.status.notification.saved = false;
      this.toastr.error('Unable to determine the patient facility for notification recipients.');
      return;
    }

    this.notificationRecipientsLoading = true;
    this.notificationRecipients = [];
    this.getNotificationRecipientRequest(this.notification.notificationTypeId)
      .subscribe({
        next: (data: NotificationRecipient[]) => {
          this.notificationRecipients = data;
          this.notificationRecipientsLoading = false;
          this.status.notification.saved = true;
        },
        error: () => {
          this.notificationRecipients = [];
          this.notificationRecipientsLoading = false;
          this.status.notification.saved = false;
          this.toastr.error('Unable to load notification recipients right now.');
        }
      });
  }

  sendTheNotification() {
    this.syncNotificationFromForm();

    if (this.notificationRecipientsLoading || this.createNotificationForm.invalid) {
      this.createNotificationForm.markAllAsTouched();
      return;
    }

    if (!this.notification.notificationOperationId) {
      this.toastr.error('Unable to determine the patient facility for notification recipients.');
      return;
    }

    if (!this.hasNotificationRecipients) {
      this.toastr.error('No notification recipients are configured for this notification type.');
      return;
    }

    if (this.createdNotificationId) {
      this.dispatchNotification(this.createdNotificationId);
      return;
    }

    this.notificationService
      .addNotificationByOperationIdAndNotificationTypeId(this.notification)
      .subscribe({
        next: (data: any) => {
          this.createdNotificationId = data.notificationId;
          this.dispatchNotification(this.createdNotificationId);
        },
        error: () => {
          this.toastr.error('Unable to create the notification right now.');
        }
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }

  private dispatchNotification(notificationId: string) {
    this.notificationService.sendNotificationByNotificationId(notificationId).subscribe({
      next: () => {
        this.toastr.success('Successfully sent notification!');
        this.dismiss();
      },
      error: () => {
        this.toastr.error('Unable to send the notification right now.');
      }
    });
  }

  get hasNotificationRecipients(): boolean {
    return Array.isArray(this.notificationRecipients) && this.notificationRecipients.length > 0;
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

  private syncNotificationFromForm() {
    if (!this.createNotificationForm) {
      return;
    }

    const formData = this.createNotificationForm.getRawValue();
    const notificationType = this.notificationTypes.find((type: NotificationType) => {
      return type.notificationTypeId == formData.notificationTypeId;
    });

    this.notification.notificationTypeId = formData.notificationTypeId || '';
    this.notification.notificationMessage = formData.notificationMessage || '';

    if (notificationType) {
      this.notification.notificationTypeLabel = notificationType.notificationTypeLabel;
      this.notification.notificationIconImage = notificationType.notificationIconImage;
    }
  }

  private primeNotificationRecipients(notificationTypeId: string) {
    if (!this.canLoadNotificationRecipients(notificationTypeId)) {
      return;
    }

    this.getNotificationRecipientRequest(notificationTypeId)
      .pipe(take(1))
      .subscribe({
        error: () => undefined
      });
  }

  private getNotificationRecipientRequest(notificationTypeId: string): Observable<NotificationRecipient[]> {
    const cacheKey = this.getNotificationRecipientCacheKey(notificationTypeId);

    if (this.notificationRecipientCache.has(cacheKey)) {
      return of(this.notificationRecipientCache.get(cacheKey) || []);
    }

    if (!this.notificationRecipientRequests.has(cacheKey)) {
      const request$ = this.notificationService
        .getNotificationRecipientsByOperationIdAndNotificationTypeId(
          this.notification.notificationOperationId,
          notificationTypeId
        )
        .pipe(
          map((data: NotificationRecipient[] | null) => (Array.isArray(data) ? data : [])),
          tap((notificationRecipients: NotificationRecipient[]) => {
            this.notificationRecipientCache.set(cacheKey, notificationRecipients);
          }),
          finalize(() => {
            this.notificationRecipientRequests.delete(cacheKey);
          }),
          shareReplay(1)
        );

      this.notificationRecipientRequests.set(cacheKey, request$);
    }

    return this.notificationRecipientRequests.get(cacheKey);
  }

  private canLoadNotificationRecipients(notificationTypeId: string): boolean {
    return !!this.notification.notificationOperationId && !!notificationTypeId;
  }

  private getNotificationRecipientCacheKey(notificationTypeId: string): string {
    return this.notification.notificationOperationId + ':' + notificationTypeId;
  }
}
