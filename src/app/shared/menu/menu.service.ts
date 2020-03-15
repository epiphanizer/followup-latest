import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

export interface MenuLink {
  linkAction: string;
  linkName: string;
  linkType: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  activeComponent: string;
  navLinks: MenuLink[];
  constructor(private route: ActivatedRouteSnapshot) {}

  getComponentMenu(activeComponent: string) {
    switch (activeComponent) {
      case 'NotificationDetailComponent':
        this.navLinks = [
          {
            linkAction: '/patient/add',
            linkName: 'Add Patient',
            linkType: 'link'
          },
          {
            linkAction: '/notifications',
            linkName: 'Notifications',
            linkType: 'link'
          }
        ];
        break;
      case 'NotificationListingComponent':
        this.navLinks = [
          {
            linkAction: '/patient/add',
            linkName: 'Add Patient',
            linkType: 'link'
          },
          {
            linkAction: '/notifications',
            linkName: 'Notifications',
            linkType: 'link'
          }
        ];
        break;
      case 'EditOperationComponent':
        this.navLinks = [
          {
            linkAction: 'operation/add',
            linkName: 'Add Operation',
            linkType: 'link'
          }
        ];
        break;
      case 'OperationDetailComponent':
        this.navLinks = [
          {
            linkAction: 'operation/add',
            linkName: 'Add Operation',
            linkType: 'link'
          }
        ];
        break;
      case 'AddPatientComponent':
        this.navLinks = [
          {
            linkAction: 'patients',
            linkName: 'Patients',
            linkType: 'link'
          }
        ];
        break;
      case 'EditPatientComponent':
        this.navLinks = [
          {
            linkAction: 'call-queue',
            linkName: 'Call Queue',
            linkType: 'link'
          },
          {
            linkAction: 'kudos',
            linkName: 'KUDOS',
            linkType: 'button'
          },
          {
            linkAction: 'report',
            linkName: 'REPORT!',
            linkType: 'button'
          }
        ];
        break;
      case 'PatientDetailComponent':
        const patientId = this.route.paramMap.get('patientId');
        const operationId = this.route.paramMap.get('operationId');
        let historyLink = '/call-queue/operations/' + operationId + '/patient/' + patientId + '/history';
        this.navLinks = [
          {
            linkAction: 'call-queue',
            linkName: 'Call Queue',
            linkType: 'link'
          },
          {
            linkAction: historyLink,
            linkName: 'HISTORY',
            linkType: 'button'
          },
          {
            linkAction: 'kudos',
            linkName: 'KUDOS',
            linkType: 'button'
          },
          {
            linkAction: 'report',
            linkName: 'REPORT!',
            linkType: 'button'
          }
        ];
        break;
      case 'PatientHistoryDetailComponent':
        let detailLink = 'detailLink';
        this.navLinks = [
          {
            linkAction: 'call-queue',
            linkName: 'Call Queue',
            linkType: 'link'
          },
          {
            linkAction: detailLink,
            linkName: 'Notes',
            linkType: 'button'
          },
          {
            linkAction: 'kudos',
            linkName: 'KUDOS',
            linkType: 'button'
          },
          {
            linkAction: 'report',
            linkName: 'REPORT!',
            linkType: 'button'
          }
        ];
        break;
      case 'PatientListingComponent':
        this.navLinks = [
          {
            linkAction: 'patient/add',
            linkName: 'Add Patient',
            linkType: 'link'
          },
          {
            linkAction: 'notifications',
            linkName: 'Notifications',
            linkType: 'link'
          }
        ];
        break;
    }

    return this.navLinks;
  }
}
