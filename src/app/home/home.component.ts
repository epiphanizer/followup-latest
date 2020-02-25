import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  providers: [],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: any;
  public menu: {}[] = [{}];
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    const avatarImage = '/assets/default-avatar@2x.png';
    if (this.user.userLevel == 3) {
      this.router.navigate(['call-queue']);
    }
    switch (this.user.userLevel) {
      case 1:
        this.menu = [
          {
            name: 'Facilities',
            action: 'operations',
            image: '/assets/icon-facilities@2x.png',
            enabled: true
          },
          {
            name: 'Patients',
            action: 'patients',
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
            name: 'View Queue',
            action: 'call-queue',
            image: '/assets/icon-view-queue@2x.png',
            enabled: true
          },
          {
            name: 'View Data',
            action: 'https://reports.followup.care',
            image: '/assets/icon-view-data@2x.png',
            enabled: true
          }
        ];
        break;
      case 2:
        this.menu = [
          {
            name: 'Patients',
            action: 'patients',
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
            name: 'View Queue',
            action: 'call-queue',
            image: '/assets/icon-view-queue@2x.png',
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
      default:
        throw 'No User Level assigned, something went wrong.';
    }
  }
}
