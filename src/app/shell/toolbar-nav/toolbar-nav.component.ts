import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';

@Component({
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(private route: ActivatedRoute, public modalController: ModalController) {}
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
