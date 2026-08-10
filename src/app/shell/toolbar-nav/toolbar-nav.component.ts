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
  private readonly productionWorkbookHosts = ['app.followup.care', 'www.app.followup.care', 'followupcare.azurewebsites.net'];

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
        linkName: 'Admin',
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
      return this.getDefaultWorkbookFileName();
    }

    return decodeURIComponent(match[1].trim()).replace(/^"|"$/g, '') || this.getDefaultWorkbookFileName();
  }

  private getDefaultWorkbookFileName(): string {
    var hostname = String(window?.location?.hostname || '').toLowerCase();

    if (this.productionWorkbookHosts.indexOf(hostname) >= 0) {
      return 'data.xlsx';
    }

    return 'data-alpha.xlsx';
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

    const activeRouteSnapshot = this.getDeepestRouteSnapshot(this.router.routerState.snapshot.root || this.route.snapshot);
    this.patient = this.getRoutePatient(activeRouteSnapshot);
    const operationId =
      this.patient?.patientOperationId ||
      this.getRouteParam(activeRouteSnapshot, 'operationId') ||
      this.getRouteParamFromUrl('operationId');

    const modal = await this.modalController.create({
      component: NotificationModalComponent,
      cssClass: 'followup-modal',
      componentProps: {
        modalType: 'Notification',
        notification: {
          notificationCreatedByUserId: this.user.userId,
          notificationMessage: '',
          notificationOperationId: operationId,
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

  private getDeepestRouteSnapshot(snapshot: ActivatedRouteSnapshot | null): ActivatedRouteSnapshot | null {
    let activeSnapshot = snapshot;

    while (activeSnapshot) {
      const nextSnapshot = activeSnapshot.firstChild || activeSnapshot.children?.[0];

      if (!nextSnapshot) {
        break;
      }

      activeSnapshot = nextSnapshot;
    }

    return activeSnapshot;
  }

  private getRoutePatient(snapshot: ActivatedRouteSnapshot | null): Patient | null {
    let activeSnapshot = snapshot;

    while (activeSnapshot) {
      if (activeSnapshot.data?.patient) {
        return activeSnapshot.data.patient as Patient;
      }

      activeSnapshot = activeSnapshot.parent;
    }

    return this.route.snapshot.data.patient || null;
  }

  private getRouteParam(snapshot: ActivatedRouteSnapshot | null, paramName: string): string {
    let activeSnapshot = snapshot;

    while (activeSnapshot) {
      const paramValue = activeSnapshot.paramMap?.get(paramName);

      if (paramValue) {
        return paramValue;
      }

      activeSnapshot = activeSnapshot.parent;
    }

    return '';
  }

  private getRouteParamFromUrl(paramName: string): string {
    const normalizedUrl = String(this.router.url || '').split('?')[0];
    const segments = normalizedUrl.split('/').filter(Boolean);

    if (paramName === 'operationId') {
      const operationSegmentIndex = segments.indexOf('operations');

      if (operationSegmentIndex >= 0 && segments[operationSegmentIndex + 1]) {
        return segments[operationSegmentIndex + 1];
      }
    }

    if (paramName === 'patientId') {
      const patientSegmentIndex = segments.indexOf('patient');

      if (patientSegmentIndex >= 0 && segments[patientSegmentIndex + 1]) {
        return segments[patientSegmentIndex + 1];
      }
    }

    return '';
  }
}
