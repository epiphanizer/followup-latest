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
  /**
   * Not with us by default, but they can be picked up
   */
  operation: Operation;
  patient: Patient;

  @Input() navLinks: [string] | null;

  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this.navLinks);
  }

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
      cssClass: 'followup-modal',
      componentProps: {
        modalType: 'Notification',
        notification: {
          notificationMessage: '',
          notificationTypeLabelId: null,
          notificationTypeLabel: ''
        },
        operation: this.operation,
        patient: this.patient
      }
    });
    return await modal.present();
  }
  async createKudosModal() {
    const modal = await this.modalController.create({
      component: KudosModalComponent,
      cssClass: 'followup-modal',
      componentProps: {
        modalType: 'Kudos',
        notification: {
          notificationMessage: 'Give your Kudos!',
          notificationTypeLabelId: 8,
          notificationTypeLabel: 'Kudos'
        },
        operation: this.operation,
        patient: this.patient
      }
    });
    return await modal.present();
  }
}
