import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute, ParamMap, Router, RoutesRecognized } from '@angular/router';

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
  public patientId: number | string;
  public operationId: number;
  constructor(private route: ActivatedRoute, private router: Router) {}

  getComponentMenu(activeComponent: string) {
    console.log(activeComponent);
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
      case 'OperationListingComponent':
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
        var callQueueLink = '/call-queue/operations/' + this.operationId;
        let historyLink = '/call-queue/operations/' + this.operationId + '/patient/' + this.patientId + '/history';
        this.navLinks = [
          {
            linkAction: callQueueLink,
            linkName: 'Call Queue',
            linkType: 'link'
          },
          {
            linkAction: historyLink,
            linkName: 'History',
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
      case 'PatientHistoryDetailComponent':
        var callQueueLink = '/call-queue/operations/' + this.operationId;
        let detailLink = '/call-queue/operations/' + this.operationId + '/patient/' + this.patientId;
        this.navLinks = [
          {
            linkAction: callQueueLink,
            linkName: 'Call Queue',
            linkType: 'link'
          },
          {
            linkAction: detailLink,
            linkName: 'Notes',
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
