import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Patient } from '@app/modules/patient/patient';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Notification, NotificationRecipient } from '@app/modules/notification/notification';
import { PatientCall } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { ToastrService } from 'ngx-toastr';
@Component({
  providers: [NotificationService, ToastrService],
  selector: 'app-kudos-modal',
  templateUrl: './kudos-modal.component.html',
  styleUrls: ['./kudos-modal.component.scss']
})
export class KudosModalComponent {
  kudosValue: number = 7;
  createNotificationForm: FormGroup;
  notification: Notification;
  notificationRecipients: NotificationRecipient[];
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
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.createForm();
    this.todaysDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  createForm() {
    this.createNotificationForm = this.fb.group({
      notificationMessage: this.fb.control('', [Validators.required])
    });
  }
  sendNotification() {
    let formData = this.createNotificationForm.getRawValue();
    this.notification.notificationTypeId = 7;
    this.notification.notificationMessage = formData.notificationMessage;
    this.notificationService
      .addNotificationByOperationIdAndNotificationTypeId(this.notification)
      .subscribe((data: any) => {
        let notificationId = data.notificationId;
        /**
         * If successful, actually email out the notification
         */
        this.notificationService.sendNotificationByNotificationId(notificationId).subscribe(() => {
          this.toastr.success('Successfully sent kudos!');
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
