import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Logger, I18nService, untilDestroyed, AuthenticationService } from '@app/core';
import { Subscription } from 'rxjs';
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { User } from 'msal';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authenticated: boolean;
  subscription: Subscription;
  constructor(private authService: AuthenticationService, private broadcastService: BroadcastService) {}

  ngOnInit() {}
  ngOnDestroy() {}
}
