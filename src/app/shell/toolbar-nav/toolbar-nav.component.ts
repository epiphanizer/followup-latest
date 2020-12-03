import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { MenuService, MenuLink } from '@app/shared/menu/menu.service';
import { map, filter } from 'rxjs/operators';

@Component({
  providers: [MenuService],
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(public modalController: ModalController, private route: ActivatedRoute, private router: Router) {}
  activeComponent: string;
  navLinks: MenuLink[];
  patient: Patient;
  user: User;

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    this.router.events
      .pipe(
        filter(e => e instanceof ActivationEnd),
        map(e => (e instanceof ActivationEnd ? e : {}))
      )
      .subscribe((e: any) => {
        console.log('navigation activation end');
      });
    this.navLinks = [
      {
        linkAction: '/admin',
        linkName: 'Admin',
        dropdown: {
          links: [
            {
              linkAction: '/team',
              linkName: 'Team Members'
            },
            {
              linkAction: '/team/message',
              linkName: 'Team Message'
            }
          ]
        },
        minRole: 1
      },
      {
        linkAction: '/operations',
        linkName: 'Operations',
        dropdown: {
          links: [
            {
              linkAction: '/operations',
              linkName: 'Operations'
            },
            {
              linkAction: '/operations/add',
              linkName: 'Add Operation'
            }
          ]
        },
        minRole: 1
      },
      {
        linkAction: '/patients',
        linkName: 'Patients',
        linkIcon: 'patient',
        dropdown: {
          links: [
            {
              linkAction: '/patients',
              linkName: 'Patients'
            },
            {
              linkAction: '/patients/add',
              linkName: 'Add Patient'
            }
          ]
        },
        minRole: 2
      },
      {
        linkAction: '/notifications',
        linkName: 'Notify',
        linkIcon: 'notify',
        dropdown: false,
        minRole: 3
      },
      {
        linkAction: '/call-queue',
        linkName: 'Queue',
        linkIcon: 'queue',
        dropdown: false,
        minRole: 3
      }
    ];
  }

  ngAfterViewInit() {}

  doButtonAction() {
    this.createNotificationModal();
  }

  async createNotificationModal() {
    const modal = await this.modalController.create({
      component: NotificationModalComponent,
      cssClass: 'followup-modal',
      componentProps: {
        modalType: 'Notification',
        notification: {
          notificationCreatedByUserId: this.user.userId,
          notificationMessage: '',
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
}
