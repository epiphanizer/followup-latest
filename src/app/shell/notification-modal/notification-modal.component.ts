import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Notification, NotificationService } from '@app/modules/notification/notification.service';
import { Patient } from '@app/modules/patient/patient';
@Component({
  providers: [NotificationService],
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
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
  constructor(private modalCtrl: ModalController, private notificationService: NotificationService) {}

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
