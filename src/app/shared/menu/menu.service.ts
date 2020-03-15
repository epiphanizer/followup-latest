import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface MenuLink {
  linkAction: string;
  linkName: string;
  linkType: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  navLinks: MenuLink[];
  constructor(private router: Router) {}

  getComponentMenu() {
    // let component = this.router.
    // patient listing
    this.navLinks = [
      {
        linkAction: 'patient/add',
        linkName: 'Add Patient',
        linkType: 'link'
      }
    ];

    return this.navLinks;
  }
}
// notification listing
// navLinks: [
//   {
//     linkAction: '/patient/add',
//     linkName: 'Add Patient',
//     linkType: 'link'
//   },
//   {
//     linkAction: '/notifications',
//     linkName: 'Notifications',
//     linkType: 'link'
//   }
// ]

// notification detail:
// navLinks: [
//   {
//     linkAction: '/patient/add',
//     linkName: 'Add Patient',
//     linkType: 'link'
//   },
//   {
//     linkAction: '/notifications',
//     linkName: 'Notifications',
//     linkType: 'link'
//   }
// ]

// patient detail:
// navLinks: [
//   {
//     linkAction: 'call-queue',
//     linkName: 'Call Queue',
//     linkType: 'link'
//   },
//   {
//     linkAction: 'history',
//     linkName: 'HISTORY',
//     linkType: 'button'
//   },
//   {
//     linkAction: 'kudos',
//     linkName: 'KUDOS',
//     linkType: 'button'
//   },
//   {
//     linkAction: 'report',
//     linkName: 'REPORT!',
//     linkType: 'button'
//   }
// ],

// operation listing:
// navLinks: [{ linkAction: 'operation/add', linkName: 'Add Operation', linkType: 'link' }],

// edit operation
// navLinks: [{ linkAction: 'operation/add', linkName: 'Add Operation', linkType: 'link' }],

// patient listing:
// navLinks: [
//   {
//     linkAction: 'patient/add',
//     linkName: 'Add Patient',
//     linkType: 'link'
//   },
//   {
//     linkAction: 'notifications',
//     linkName: 'Notifications',
//     linkType: 'link'
//   }
// ],
// patient history:
// navLinks: [
//   {
//     linkAction: 'call-queue',
//     linkName: 'Call Queue',
//     linkType: 'link'
//   },
//   {
//     linkAction: 'notes',
//     linkName: 'Notes',
//     linkType: 'button'
//   },
//   {
//     linkAction: 'kudos',
//     linkName: 'KUDOS',
//     linkType: 'button'
//   },
//   {
//     linkAction: 'report',
//     linkName: 'REPORT!',
//     linkType: 'button'
//   }
// ],

// add patient:
// navLinks: [
//   {
//     linkAction: 'patients',
//     linkName: 'Patients',
//     linkType: 'link'
//   }
// ],

// edit patient
// navLinks: [
//   {
//     linkAction: 'call-queue',
//     linkName: 'Call Queue',
//     linkType: 'link'
//   },
//   {
//     linkAction: 'kudos',
//     linkName: 'KUDOS',
//     linkType: 'button'
//   },
//   {
//     linkAction: 'report',
//     linkName: 'REPORT!',
//     linkType: 'button'
//   }
// ],
