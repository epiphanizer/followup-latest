import { Input, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
  // Data passed in by componentProps
  @Input() notificationTypeId: number;
  @Input() notificationTypeLabel: string;

  constructor(private modalCtrl: ModalController) {
    alert('creating notification of type: ' + this.notificationTypeId);
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
