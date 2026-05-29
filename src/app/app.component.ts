import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { TelemetryService } from '@app/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  authenticated: boolean;
  private routeSubscription: Subscription;

  constructor(private router: Router, private telemetry: TelemetryService) {}

  ngOnInit() {
    this.telemetry.initialize();
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.telemetry.trackPageView(event.urlAfterRedirects || event.url);
      });

    // window.location.href = '/home';
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
