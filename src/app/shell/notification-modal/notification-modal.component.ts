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
  notificationTypes: {};
  constructor(private modalCtrl: ModalController, private notificationService: NotificationService) {}
  saveNotification() {
    this.notificationService.saveNotificationByPatientId(this.patient.patientId);
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
