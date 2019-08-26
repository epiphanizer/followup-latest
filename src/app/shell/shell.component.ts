import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { AlertsService } from '@app/core/alerts/alerts.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  navLinks?: [string];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private authenticationService: AuthenticationService
  ) {
    if (this.route.snapshot.data.navLinks) {
      this.navLinks = this.route.snapshot.data.navLinks;
    }
    /**
     * Doesn't seem to register before child does
     */
  }

  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
