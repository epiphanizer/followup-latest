import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Notification, NotificationService } from '@app/modules/notification/notification.service';
import { Patient } from '@app/modules/patient/patient';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
@Component({
  providers: [NotificationService],
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  createNotificationForm: FormGroup;
  @Input() patient: Patient;
  notification: Notification;
  notificationTypes: {
    notificationTypeLabelId: number;
    notificationTypeLabel: string;
  };
  status: {
    notification: {
      saved: boolean;
    };
  } = {
    notification: {
      saved: false
    }
  };
  todaysDateDay: number;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.notificationService.getNotificationStatusLabels().subscribe((data: any) => {
      this.notificationTypes = data;
      return data;
    });
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
    this.createForm();
  }
  createForm() {
    this.createNotificationForm = this.fb.group({
      notificationType: this.fb.control({}),
      notificationNotes: this.fb.control({})
    });
  }
  editNotification() {
    this.status.notification.saved = false;
  }
  saveNotification() {
    alert('saving notifcation');
    this.notificationService.saveNotificationByPatientId(this.patient.patientId);
    // We will want to subscribe here
    this.status.notification.saved = true;
  }
  sendNotification() {
    alert('sending notification');
    this.notificationService.sendNotificationByNotificationId(this.patient.patientId);
    this.dismiss();
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
