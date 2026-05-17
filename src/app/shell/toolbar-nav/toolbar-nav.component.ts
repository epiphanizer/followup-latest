import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User, UserRoles, UserRolesMap } from '@app/modules/user/user';
import { MenuService, MenuLink } from '@app/shared/menu/menu.service';
import { map, filter } from 'rxjs/operators';
import { DataService } from '@app/modules/data/data.service';
import { AuthenticationService } from '@app/core';
import * as FileSaver from 'file-saver';

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
    private dataService: DataService,
    private authService: AuthenticationService
  ) {}

  callQueuePage: boolean = false;
  dropdowns: any[] = [];
  dropdownActivated: boolean = false;
  navLinks: MenuLink[];
  patient: Patient;
  userRoles = UserRoles;
  user: User;
  userRolesMap: Array<[string, number]> = [];
  userRolesArray: Record<string, number> = {};
  @Output() dropdownEvent: EventEmitter<Boolean> = new EventEmitter(false);
  @Output() serviceHealthRequested: EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() {
    this.user = this.authService.currentUserValue || this.route.snapshot.data.user;
    this.authService.currentUser.subscribe((user: User) => {
      if (user) {
        this.user = user;
      }
    });
    this.userRolesMap = Object.entries(UserRolesMap) as Array<[string, number]>;
    this.userRolesArray = {};
    this.userRolesMap.forEach(userRole => {
      this.userRolesArray[userRole[0]] = userRole[1];
    });
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
            // {
            //   linkAction: '/users',
            //   linkName: 'User Management'
            // },
            {
              linkAction: 'getExcelReport',
              dynamic: true,
              linkName: 'Excel Report'
            },
            {
              linkAction: 'toggleServiceHealth',
              dynamic: true,
              linkName: 'Service Health'
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
        minRole: 2
      },
      {
        linkAction: '/patients',
        linkName: 'Patient Portal',
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

  getUserRoleValue(user: User): number {
    if (!user) {
      return 0;
    }
    if (typeof user.userLevel === 'number') {
      return user.userLevel;
    }
    const mappedRole = this.userRolesArray[String(user.userLevel)];
    return mappedRole ? mappedRole : 0;
  }

  createNotification() {
    this.createNotificationModal();
  }
  // switch for any dynamic linking
  dynamicLink(link: MenuLink) {
    if (link.linkAction == 'createNotification') {
      if (this.callQueuePage) {
        this.createNotification();
      }
    }
    if (link.linkAction == 'getExcelReport') {
      this.dataService.getData().subscribe((data: Blob) => {
        var blob = new Blob([data], { type: data.type });
        FileSaver.saveAs(blob, 'data.xlsx');
      });
    }
    if (link.linkAction == 'toggleServiceHealth') {
      this.closeDropdowns();
      this.serviceHealthRequested.emit();
    }
  }
  closeDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.activated = false;
    });
    this.dropdownActivated = false;
  }
  closeDropdown(i: number) {
    this.dropdowns[i].activated = false;
    this.dropdownActivated = false;
  }
  openDropdown(i: number) {
    /**
     * Close all dropdowns that may already be open.
     */
    this.dropdowns.forEach((dropdown, index) => {
      dropdown.activated = false;
    });
    // emit false to close the profile dropdown if we open a nav dropdown
    // (we have to do this due to layout constraints)
    this.dropdownEvent.emit(false);
    /**
     * Check for any existing dropdowns;
     */
    this.dropdownActivated = true;
    this.dropdowns[i].activated = true;
  }
  toggleDropdown(i: number, $event: any) {
    // emit false to close the profile dropdown if we open a nav dropdown
    // (we have to do this due to layout constraints)
    this.dropdownEvent.emit(false);
    this.dropdowns[i].activated = !this.dropdowns[i].activated;
    /**
     * We do a quick check here for our mouseout event...
     * We only want to toggle off if we are not inside of an open dropdown.
     */
    var activeDropdown = document.getElementsByClassName('active dropdown');
    if (activeDropdown[0]) {
      var box = activeDropdown[0] as HTMLElement;
      var boundingBox = box.getBoundingClientRect() as DOMRect;
      if ($event) {
        if ($event.clientX - (boundingBox.x + boundingBox.width) < 0) {
          this.dropdowns[i].activated = !this.dropdowns[i].activated;
        }
      }
    }
  }

  async createNotificationModal() {
    if (this.route.snapshot.children) {
      this.patient = this.route.snapshot.children[0].data.patient;
    } else {
      this.patient = this.route.snapshot.data.patient;
    }

    const modal = await this.modalController.create({
      component: NotificationModalComponent,
      cssClass: 'followup-modal',
      componentProps: {
        modalType: 'Notification',
        notification: {
          notificationCreatedByUserId: this.user.userId,
          notificationMessage: '',
          notificationOperationId: this.patient?.patientOperationId,
          notificationPatientFirstName: this.patient?.patientFirstName,
          notificationPatientLastName: this.patient?.patientLastName,
          notificationPatientMedicalRecordNumber: this.patient?.patientMedicalRecordNumber,
          notificationOperationName: this.patient?.patientOperationName,
          notificationPatientId: this.patient?.patientId,
          notificationTypeId: 0,
          notificationTypeLabel: ''
        }
      }
    });
    return await modal.present();
  }
}
