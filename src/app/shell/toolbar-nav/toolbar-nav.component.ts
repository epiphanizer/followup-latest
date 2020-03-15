import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { KudosModalComponent } from '../kudos-modal/kudos-modal.component';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { Location } from '@angular/common';
import { MenuService, MenuLink } from '@app/shared/menu/menu.service';

@Component({
  providers: [MenuService],
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(private menuService: MenuService, public modalController: ModalController, private router: Router) {}
  activeComponent: string;
  navLinks: MenuLink[];
  patient: Patient;
  user: User;

  ngOnInit() {
    this.router.events.subscribe(val => {
      if (val instanceof ActivationEnd) {
        this.activeComponent = val.snapshot.component['name'];
        if (this.activeComponent != 'ShellComponent') {
          console.log(this.activeComponent);
          this.navLinks = this.menuService.getComponentMenu(this.activeComponent);
        }
      }
    });
  }

  ngAfterViewInit() {}

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
          notificationCreatedByUserId: this.user.userId,
          notificationMessage: 'Give your Kudos!',
          notificationOperationId: this.patient.patientOperationId,
          notificationPatientFirstName: this.patient.patientFirstName,
          notificationPatientLastName: this.patient.patientLastName,
          notificationPatientMedicalRecordNumber: this.patient.patientMedicalRecordNumber,
          notificationOperationName: this.patient.patientOperationName,
          notificationPatientId: this.patient.patientId,
          notificationTypeId: 0,
          notificationTypeLabel: ''
        }
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
          notificationCreatedByUserId: this.user.userId,
          notificationMessage: 'Give your Kudos!',
          notificationOperationId: this.patient.patientOperationId,
          notificationPatientFirstName: this.patient.patientFirstName,
          notificationPatientLastName: this.patient.patientLastName,
          notificationPatientMedicalRecordNumber: this.patient.patientMedicalRecordNumber,
          notificationOperationName: this.patient.patientOperationName,
          notificationPatientId: this.patient.patientId,
          notificationTypeId: 7,
          notificationTypeLabel: 'Kudos'
        }
      }
    });
    return await modal.present();
  }
}
