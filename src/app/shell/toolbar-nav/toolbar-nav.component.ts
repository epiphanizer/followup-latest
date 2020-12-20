import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { MenuService, MenuLink } from '@app/shared/menu/menu.service';
import { map, filter } from 'rxjs/operators';
import { DataService } from '@app/modules/data/data.service';

@Component({
  providers: [DataService, MenuService],
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(
    public modalController: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}
  dropdowns: any[] = [];
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
          activated: false,
          links: [
            {
              linkAction: '/team',
              linkName: 'Team Members'
            },
            {
              linkAction: '/team/message',
              linkName: 'Team Message'
            },
            {
              linkAction: '/data',
              linkName: 'Excel Report'
            }
          ]
        },
        minRole: 1
      },
      {
        linkAction: '/operations',
        linkName: 'Operations',
        dropdown: {
          activated: false,
          links: [
            {
              linkAction: '/operations',
              linkName: 'Operations'
            },
            {
              linkAction: '/operation/add',
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
          activated: false,
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
    this.navLinks.forEach(dropdown => {
      if (!dropdown.dropdown) return;
      this.dropdowns.push(dropdown);
    });
  }

  ngAfterViewInit() {}

  doButtonAction() {
    this.createModal();
  }

  closeDropdown(i: number) {
    this.dropdowns[i].activated = false;
  }

  toggleDropdown(i: number, $event: any) {
    console.log('toggling dropdown: ' + i);
    console.log(this.dropdowns);
    this.dropdowns[i].activated = !this.dropdowns[i].activated;
    /**
     * We do a quick check here for our mouseout event...
     * We only want to toggle off if we are not inside of an open dropdown.
     */
    var activeDropdown = document.getElementsByClassName('active dropdown');
    if (activeDropdown[0]) {
      var boundingBox = activeDropdown[0].getBoundingClientRect();
      console.log(boundingBox);
      console.log($event);
      console.log($event.clientX - (boundingBox.x + boundingBox.width));
      if ($event.clientX - (boundingBox.x + boundingBox.width) < 0) {
        console.log('condition met on x axis');
        this.dropdowns[i].activated = !this.dropdowns[i].activated;
      }
    }
  }

  async createModal() {
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
