import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { KudosModalComponent } from '../kudos-modal/kudos-modal.component';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';

@Component({
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, public modalController: ModalController) {}

  @Input() navLinks: [string] | null;
  patient: Patient;
  user: User;

  ngOnInit() {
    this.route.url.subscribe(() => {
      if (this.route.snapshot.firstChild) {
        if (this.route.snapshot.firstChild.data.patient) {
          this.patient = this.route.snapshot.firstChild.data.patient;
        }
      }
    });
    this.route.url.subscribe(() => {
      if (this.route.snapshot.data.user) {
        this.user = this.route.snapshot.data.user;
      }
    });
  }

  ngAfterViewInit() {}

  doButtonAction(buttonAction: string) {
    if (buttonAction == 'report') {
      this.createNotificationModal();
    } else if (buttonAction == 'kudos') {
      this.createKudosModal();
    } else if (buttonAction == 'history') {
      let routerUrl = this.router.url + '/history';
      this.router.navigate([routerUrl]);
    } else if (buttonAction == 'notes') {
      let routerUrl = this.router.url;
      this.router.navigate([routerUrl]);
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
