import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { KudosModalComponent } from '../kudos-modal/kudos-modal.component';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { MenuService, MenuLink } from '@app/shared/menu/menu.service';
import { map, filter } from 'rxjs/operators';
import { PatientListingComponent } from '@app/modules/patient/patient-listing/patient-listing.component';
import { NotificationDetailComponent } from '@app/modules/notification/notification-detail/notification-detail.component';
import { NotificationListingComponent } from '@app/modules/notification/notification-listing/notification-listing.component';
import { OperationFormComponent } from '@app/modules/operation/operation-form/operation-form.component';
import { OperationListingComponent } from '@app/modules/operation/operation-listing/operation-listing.component';
import { PatientFormComponent } from '@app/modules/patient/patient-form/patient-form.component';
import { PatientDetailComponent } from '@app/modules/patient/patient-detail/patient-detail.component';
import { PatientHistoryDetailComponent } from '@app/modules/patient/patient-detail/patient-history-detail.component';

@Component({
  providers: [MenuService],
  selector: 'app-toolbar-nav',
  templateUrl: './toolbar-nav.component.html',
  styleUrls: ['./toolbar-nav.component.scss']
})
export class ToolbarNavComponent implements OnInit {
  constructor(
    private menuService: MenuService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private router: Router
  ) {}
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
        // console.log(this.route.routeConfig);
        if (this.route.snapshot.firstChild) {
          this.patient = this.route.snapshot.firstChild.data.patient;
        }
        this.activeComponent = this.getType(e.snapshot.component);
        console.log(this.activeComponent);
        if (e.snapshot.params['patientId']) {
          this.menuService.patientId = e.snapshot.params['patientId'];
        }
        if (e.snapshot.params['operationId']) {
          this.menuService.operationId = e.snapshot.params['operationId'];
        }
        if (this.activeComponent != 'ShellComponent') {
          this.navLinks = this.menuService.getComponentMenu(this.activeComponent);
        }
      });
  }

  /**
   * Refer to
   * @link https://stackoverflow.com/questions/46561116/angular4-component-name-doesnt-work-on-production
   * as to why we have to do this.
   */
  getType(o: any): string {
    if (o === NotificationDetailComponent) {
      return 'NotificationDetailComponent';
    } else if (o === NotificationListingComponent) {
      return 'NotificationListingComponent';
    } else if (o === OperationFormComponent) {
      return 'OperationFormComponent';
    } else if (o === OperationListingComponent) {
      return 'OperationListingComponent';
    } else if (o === PatientFormComponent) {
      return 'PatientFormComponent';
    } else if (o === PatientDetailComponent) {
      return 'PatientDetailComponent';
    } else if (o === PatientHistoryDetailComponent) {
      return 'PatientHistoryDetailComponent';
    } else if (o === PatientListingComponent) {
      return 'PatientListingComponent';
    }
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
