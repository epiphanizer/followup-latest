import { Injectable, ComponentRef, Component } from '@angular/core';
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
      case 'OperationFormComponent':
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
      case 'PatientFormComponent':
        var historyLink = '/call-queue/operations/' + this.operationId + '/patient/' + this.patientId + '/history';
        this.navLinks = [
          {
            linkAction: 'patient/add',
            linkName: 'Add Patient',
            linkType: 'link'
          }
        ];
        break;
      case 'PatientDetailComponent':
        var callQueueLink = '/call-queue/operations/' + this.operationId;
        var historyLink = '/call-queue/operations/' + this.operationId + '/patient/' + this.patientId + '/history';
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
        var callQueueLink = '/call-queue';
        if (this.operationId) {
          callQueueLink += '/operations/' + this.operationId;
        }
        this.navLinks = [
          {
            linkAction: 'patient/add',
            linkName: 'Add Patient',
            linkType: 'link'
          },
          {
            linkAction: callQueueLink,
            linkName: 'Call Queue',
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
