import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { PostItModalComponent } from '../post-it-modal/post-it-modal.component';
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
  // Are we on call-queue page?
  callQueuePage: boolean = false;
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
        if (window.location.href.indexOf('call') != -1 && window.location.href.indexOf('patient') != -1) {
          this.callQueuePage = true;
        } else {
          this.callQueuePage = false;
        }
        console.log('call queue page? ' + this.callQueuePage);
        console.log('navigation activation end');
      });
    this.navLinks = [
      {
        linkAction: '/teams',
        linkName: 'Admin',
        dynamic: false,
        dropdown: {
          activated: false,
          links: [
            {
              linkAction: '/teams',
              linkName: 'Team Members'
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
        dynamic: false,
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
        dynamic: false,
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
            },
            {
              linkAction: '/notifications',
              linkName: 'Patient Notifications'
            }
          ]
        },
        minRole: 2
      },
      {
        linkAction: '/call-queue',
        linkName: 'Queue',
        linkIcon: 'queue',
        dropdown: false,
        dynamic: false,
        minRole: 3
      },
      {
        linkAction: 'createNotification',
        linkName: 'Notify',
        linkIcon: 'notify',
        dropdown: false,
        dynamic: true,
        minRole: 3
      }
    ];
    this.navLinks.forEach(dropdown => {
      if (!dropdown.dropdown) return;
      this.dropdowns.push(dropdown);
    });
  }

  ngAfterViewInit() {}

  createNotification() {
    this.createNotificationModal();
  }
  // switch for any dynamic linking
  dynamicLink(link: MenuLink) {
    if (link.linkAction == 'doNotification') {
      if (this.callQueuePage) {
        this.createNotification();
      }
    }
  }
  closeDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.activated = false;
    });
  }
  closeDropdown(i: number) {
    this.dropdowns[i].activated = false;
  }
  openDropdown(i: number) {
    /**
     * Close all dropdowns that may already be open.
     */
    this.dropdowns.forEach((dropdown, index) => {
      dropdown.activated = false;
    });
    /**
     * Check for any existing dropdowns;
     */
    this.dropdowns[i].activated = true;
  }
  toggleDropdown(i: number, $event: any) {
    this.dropdowns[i].activated = !this.dropdowns[i].activated;
    /**
     * We do a quick check here for our mouseout event...
     * We only want to toggle off if we are not inside of an open dropdown.
     */
    var activeDropdown = document.getElementsByClassName('active dropdown');
    if (activeDropdown[0]) {
      var box = activeDropdown[0] as HTMLElement;
      var boundingBox = box.getBoundingClientRect() as DOMRect;
      if ($event.clientX - (boundingBox.x + boundingBox.width) < 0) {
        this.dropdowns[i].activated = !this.dropdowns[i].activated;
      }
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
