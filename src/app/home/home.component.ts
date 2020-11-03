import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/modules/data/data.service';
import * as FileSaver from 'file-saver';

@Component({
  providers: [DataService],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: any;
  public menu: {}[] = [{}];
  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    alert('home component');
    this.user = this.route.snapshot.data.user;

    /**
     * Bypass the menu for a call queue (lowest tier) user
     */
    if (this.user.userLevel == 3) {
      this.router.navigate(['call-queue']);
    }

    switch (this.user.userLevel) {
      case 1:
        this.menu = [
          {
            name: 'Facilities',
            link: 'operations',
            image: '/assets/icon-facilities@2x.png',
            enabled: true
          },
          {
            name: 'Patients',
            link: 'patients',
            image: '/assets/icon-patients@2x.png',
            enabled: true
          },
          {
            name: 'Notifications',
            link: 'notifications',
            image: '/assets/icon-manager-notifications@2x.png',
            enabled: true
          },
          {
            name: 'View Queue',
            link: 'call-queue',
            image: '/assets/icon-view-queue@2x.png',
            enabled: true
          },
          {
            name: 'View Data',
            action: 'getData',
            type: 'action',
            image: '/assets/icon-view-data@2x.png',
            enabled: true
          }
        ];
        break;
      case 2:
        this.menu = [
          {
            name: 'Facilities',
            link: 'operations',
            image: '/assets/icon-facilities@2x.png',
            enabled: true
          },
          {
            name: 'Patients',
            link: 'patients',
            image: '/assets/icon-patients@2x.png',
            enabled: true
          },
          {
            name: 'Notifications',
            link: 'notifications',
            image: '/assets/icon-manager-notifications@2x.png',
            enabled: true
          },
          {
            name: 'View Queue',
            link: 'call-queue',
            image: '/assets/icon-view-queue@2x.png',
            enabled: true
          }
        ];
        break;
      case 3:
        this.menu = [
          {
            name: 'Call Queue',
            link: 'call-queue',
            image: '/assets/icon-call-queue@2x.png',
            enabled: true
          }
        ];
        break;
      default:
        throw 'No User Level assigned, something went wrong.';
    }
  }
  doAction(actionType: string, $event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    /**
     * Get an Excel with current Wizard Bridge definitions
     */
    if (actionType == 'getData') {
      this.getData();
    }
  }
  getData() {
    this.dataService.getData().subscribe((data: Blob) => {
      var blob = new Blob([data], { type: data.type });
      FileSaver.saveAs(blob, 'data.xlsx');
    });
  }
}
