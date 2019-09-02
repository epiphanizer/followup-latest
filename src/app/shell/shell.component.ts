import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  navLinks?: {
    linkName: string;
    linkAction: string;
  }[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private authenticationService: AuthenticationService,
    public modalController: ModalController
  ) {
    this.createNotificationModal();
    if (this.route.snapshot.data.navLinks) {
      this.navLinks = this.route.snapshot.data.navLinks;
    }
  }
  async createNotificationModal() {
    const modal = await this.modalController.create({
      component: NotificationModalComponent,
      componentProps: {
        notificationTypeId: '1',
        notificationTypeLabel: 'Label'
      }
    });
    return await modal.present();
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
