import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Patient } from '@app/modules/patient/patient';
import { User, UserRoles, UserRolesMap } from '@app/modules/user/user';
import { MenuService, MenuLink } from '@app/shared/menu/menu.service';
import { map, filter, take } from 'rxjs/operators';
import { DataService } from '@app/modules/data/data.service';
import { AuthenticationService } from '@app/core';
import * as FileSaver from 'file-saver';

export type ServiceHealthRequestMode = 'panel' | 'change-log';

@Component({
  providers: [DataService, MenuService],
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss'],
  standalone: false
})
export class ToolbarNavComponent implements OnInit {
  constructor(
    public modalController: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthenticationService,
    private notificationService: NotificationService
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
  @Output() serviceHealthRequested: EventEmitter<ServiceHealthRequestMode> = new EventEmitter<
    ServiceHealthRequestMode
  >();

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
        linkName: 'Team Management',
        dynamic: false,
        dropdown: {
          activated: false,
          links: [
            {
              linkAction: '/teams',
              linkName: 'Team Management',
              minRole: 1
            },
            {
              linkAction: '/users',
              linkName: 'User Management',
              minRole: 2
            },
            {
              linkAction: 'toggleServiceHealth',
              dynamic: true,
              linkName: 'Service Health',
              minRole: 1
            },
            {
              linkAction: 'getExcelReport',
              dynamic: true,
              linkName: 'Excel Report',
              minRole: 1
            }
          ]
        },
        minRole: 2
      },
      {
        linkAction: '/clients',
        linkName: 'Clients',
        dynamic: false,
        dropdown: {
          activated: false,
          links: [
            {
              linkAction: '/clients',
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
              linkName: 'Add Patient',
              minRole: 2
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

  canAccessLink(link: MenuLink | { minRole?: number } | undefined | null): boolean {
    if (!link?.minRole) {
      return true;
    }

    return link.minRole >= this.getUserRoleValue(this.user);
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
      this.dataService.getData().subscribe(response => {
        var data = response?.body;
        if (!data) {
          return;
        }

        var blob = new Blob([data], { type: data.type || 'application/octet-stream' });
        FileSaver.saveAs(blob, this.getDownloadFileName(response.headers?.get('content-disposition')));
      });
    }
    if (link.linkAction == 'toggleServiceHealth') {
      this.closeDropdowns();
      this.serviceHealthRequested.emit('panel');
    }
  }
  closeDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.activated = false;
    });
    this.dropdownActivated = false;
  }

  private getDownloadFileName(contentDisposition: string | null): string {
    var match = String(contentDisposition || '').match(/filename\*?=(?:UTF-8''|\")?([^";]+)/i);

    if (!match || !match[1]) {
      return 'data.xlsx';
    }

    return decodeURIComponent(match[1].trim()).replace(/^"|"$/g, '') || 'data.xlsx';
  }

  closeDropdown(i: number) {
    this.dropdowns[i].activated = false;
    this.dropdownActivated = this.dropdowns.some(dropdown => dropdown.activated);
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
  toggleDropdown(i: number, $event?: Event) {
    // emit false to close the profile dropdown if we open a nav dropdown
    // (we have to do this due to layout constraints)
    this.dropdownEvent.emit(false);
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    const shouldOpen = !this.dropdowns[i].activated;
    this.closeDropdowns();
    this.dropdownActivated = shouldOpen;
    this.dropdowns[i].activated = shouldOpen;
  }

  async createNotificationModal() {
    this.notificationService.getNotificationTypes().pipe(take(1)).subscribe({
      error: () => {
        // Let the modal render its own error state if the shared preload fails.
      }
    });

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
