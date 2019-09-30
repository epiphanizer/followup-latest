import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { KudosModalComponent } from '../kudos-modal/kudos-modal.component';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Operation } from '@app/modules/operation/operation.service';
import { Patient } from '@app/modules/patient/patient';

@Component({
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(private route: ActivatedRoute, public modalController: ModalController) {}
  @Input() operation: Operation;
  @Input() patient: Patient;
  @Input() navLinks: [string] | null;

  ngOnInit() {}

  doButtonAction(buttonAction: string) {
    if (buttonAction == 'report') {
      this.createNotificationModal();
    } else if (buttonAction == 'kudos') {
      this.createKudosModal();
    }
  }

  async createNotificationModal() {
    const modal = await this.modalController.create({
      component: NotificationModalComponent,
      componentProps: {
        modalType: 'Notification',
        notificationTypeLabel: 'Label'
      }
    });
    return await modal.present();
  }
  async createKudosModal() {
    const modal = await this.modalController.create({
      component: KudosModalComponent,
      componentProps: {
        modalType: 'Kudos',
        notificationTypeLabel: 'Kudos'
      }
    });
    return await modal.present();
  }
}
