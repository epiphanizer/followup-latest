import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
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
    this.createNotificationModal(buttonAction);
  }

  async createNotificationModal(buttonAction: string) {
    const modal = await this.modalController.create({
      component: NotificationModalComponent,
      componentProps: {
        modalType: buttonAction,
        notificationTypeLabel: 'Label'
      }
    });
    return await modal.present();
  }
}
