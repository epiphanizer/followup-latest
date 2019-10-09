import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: any;
  public menu: {}[] = [{}];
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    const avatarImage = '/assets/default-avatar@2x.png';

    switch (this.user.userLevel) {
      case 1:
        this.menu = [
          {
            name: 'Facilities',
            action: 'operation/add',
            image: '/assets/icon-facilities@2x.png',
            enabled: true
          },
          {
            name: 'Notifications',
            action: 'notifications',
            image: '/assets/icon-manager-notifications@2x.png',
            enabled: true
          },
          {
            name: 'User Management',
            action: 'admin/user',
            image: '/assets/icon-user-management@2x.png',
            enabled: false
          },
          {
            name: 'View Queue',
            action: 'admin/call-queue',
            image: '/assets/icon-view-queue@2x.png',
            enabled: false
          },
          {
            name: 'View Data',
            action: 'admin/data',
            image: '/assets/icon-view-data@2x.png',
            enabled: false
          }
        ];
        break;
      case 2:
        this.menu = [
          {
            name: 'Patients',
            action: 'patient/add',
            image: '/assets/icon-patients@2x.png',
            enabled: true
          },
          {
            name: 'Notifications',
            action: 'notifications',
            image: '/assets/icon-manager-notifications@2x.png',
            enabled: true
          },
          {
            name: 'My Profile',
            action: 'user/profile',
            image: avatarImage,
            enabled: true
          }
        ];
        break;
      case 3:
        this.menu = [
          {
            name: 'Call Queue',
            action: 'call-queue',
            image: '/assets/icon-call-queue@2x.png',
            enabled: true
          },
          { name: 'My Profile', action: 'user/profile', image: avatarImage, enabled: true }
        ];
        break;
      default:
        throw 'No User Level assigned, something went wrong.';
    }
  }
}
