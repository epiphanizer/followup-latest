import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '../../patient';
import { NotificationService } from '@app/modules/notification/notification.service';
import { FollowupCompleteModalComponent } from '../followup-complete-modal/followup-complete-modal.component';

@Component({
  selector: 'app-followup-complete-button',
  templateUrl: './followup-complete-button.component.html',
  styleUrls: ['./followup-complete-button.component.scss']
})
export class FollowupCompleteButtonComponent implements OnInit {
  @Input() patient: Patient;
  constructor(private modalCtrl: ModalController, private notificationService: NotificationService) {}

  ngOnInit() {}
  async createFollowupCompleteModal(buttonAction: string) {
    const modal = await this.modalCtrl.create({
      component: FollowupCompleteModalComponent
    });
    return await modal.present();
  }
}
