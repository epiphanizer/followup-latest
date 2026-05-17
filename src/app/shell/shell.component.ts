import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { HostListener } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { of, Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';
import { UserCorkBoardService } from './user-cork-board/user-cork-board.service';
import { API_KEY_AUTH_VALUE } from '@app/shared/interceptors/api-key.interceptor';

interface ServiceStatusResponse {
  status?: string;
  service?: {
    name?: string;
    host?: string;
    version?: string;
    environment?: string;
  };
  database?: {
    name?: string;
    role?: string;
  };
  error?: string;
}

interface ServiceStatusViewModel {
  health: 'checking' | 'ok' | 'degraded';
  healthLabel: string;
  apiName: string;
  apiHost: string;
  apiVersion: string;
  environment: string;
  databaseName: string;
  databaseRole: string;
  error: string;
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  private readonly statusRefreshMs = 60000;
  private readonly statusHttp: HttpClient;
  corkboardExpanded: boolean = false;
  corkBoardSubscription: Subscription;
  dropdownActive: Boolean = false;
  user: User;
  impersonator: User;
  patient: Patient;
  navLinks?: {
    linkName: string;
    linkAction: string;
  }[];
  routeSubscription: Subscription;
  timeSinceLastAction: number;
  userActionSinceLastUpdate: boolean = false;
  userCorkBoardExpanded: boolean = false;
  version: string = environment.version;
  currentUserSubscription: Subscription;
  impersonatorSubscription: Subscription;
  serviceStatusSubscription: Subscription;
  serviceStatus: ServiceStatusViewModel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    public modalController: ModalController,
    private toastrService: ToastrService,
    private userCorkBoardService: UserCorkBoardService,
    httpBackend: HttpBackend,
    private _cdr: ChangeDetectorRef
  ) {
    this.statusHttp = new HttpClient(httpBackend);
    this.serviceStatus = this.buildCheckingStatus();
  }
  ngOnInit() {
    this.user = this.authenticationService.currentUserSubject.getValue();
    this.impersonator = this.authenticationService.impersonatorValue;
    if (window.location.pathname == '/') {
      this.router.navigate(['/home']);
    }
    this.updateUserExpiry();
    /**
     * Slated for deprecation
     */
    this.routeSubscription = this.route.url.subscribe(() => {
      if (this.route.snapshot.firstChild) {
        if (this.route.snapshot.firstChild.data.navLinks) {
          this.navLinks = this.route.snapshot.firstChild.data.navLinks;
        }
      } else {
        this.navLinks = null;
      }
    });
    this.setIdleLogoutTimer();
    this.corkBoardSubscription = this.userCorkBoardService.menuStateBSubject.subscribe(() => {
      this.userCorkBoardExpanded = this.userCorkBoardService.isOpen;
    });
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe((user: User) => {
      this.user = user;
    });
    this.impersonatorSubscription = this.authenticationService.impersonator.subscribe((impersonator: User) => {
      this.impersonator = impersonator;
    });
    this.startServiceStatusPolling();
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(e: any) {
    if (this.userCorkBoardExpanded) {
      this.userCorkBoardExpanded = false;
      this.userCorkBoardService.isOpen = false;
      this.userCorkBoardService.menuStateBSubject.next(false);
    }
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    this.updateUserExpiry();
  }
  @HostListener('document:touchstart', ['$event'])
  onTouchStart(e: any) {
    this.updateUserExpiry();
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: any) {
    this.updateUserExpiry();
  }

  updateUserExpiry() {
    /**
     * Updates our expire time within the shell component
     */
    var date = new Date();
    this.user = this.authenticationService.currentUserSubject.getValue();
    this.user.userLoginExpires = date.getTime() + 900000;
    this.authenticationService.currentUserSubject.next(this.user);
    localStorage.removeItem('followup-user');
    localStorage.setItem('followup-user', JSON.stringify(this.user));
    this.userActionSinceLastUpdate = false;
  }
  setIdleLogoutTimer() {
    var self = this;
    setInterval(function() {
      self.user = self.authenticationService.currentUserSubject.getValue();
      var date = new Date();
      var currentTime = date.getTime();
      var timeRemaining = Math.round((self.user.userLoginExpires - currentTime) / 1000);
      if (self.user.userLoginExpires - currentTime < 30000) {
        self.toastrService.success('Your session will log out in ' + timeRemaining + ' seconds due to inactivity!');
      }
      if (currentTime > self.user.userLoginExpires) {
        self.signOut();
      }
    }, 5000);
  }
  corkBoardExpandedHandler(toggleState: boolean) {
    this.corkboardExpanded = toggleState;
  }

  addNewCorkBoardItem() {
    if (!this.userCorkBoardService.isOpen) {
      this.userCorkBoardService.toggleCorkboardState();
    }
    this.userCorkBoardService.doUpload(this.user).then(() => {
      this.toastrService.success('Successfully added cork board item.');
      this.userCorkBoardService.userCorkBoardUpdated();
    });
  }
  toggleDropdown($event: boolean) {
    this.dropdownActive = $event;
  }
  signOut() {
    this.authenticationService.signOut(this.user.userId);
    this.router.navigate(['/login']);
  }

  stopImpersonation() {
    this.authenticationService.stopImpersonation();
  }

  private startServiceStatusPolling() {
    const headers = new HttpHeaders({
      ApiKeyAuth: API_KEY_AUTH_VALUE,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    });

    this.serviceStatusSubscription = timer(0, this.statusRefreshMs)
      .pipe(
        switchMap(() =>
          this.statusHttp
            .get<ServiceStatusResponse>(this.getServiceStatusUrl(), { headers })
            .pipe(catchError(error => of(this.normalizeServiceStatusError(error))))
        )
      )
      .subscribe((status: ServiceStatusResponse) => {
        this.serviceStatus = this.mapServiceStatus(status);
        this._cdr.markForCheck();
      });
  }

  private getServiceStatusUrl(): string {
    return `${environment.apiUrl}statusz`;
  }

  private getConfiguredApiHost(): string {
    try {
      return new URL(environment.apiUrl).host;
    } catch (_error) {
      return environment.apiUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
  }

  private buildCheckingStatus(): ServiceStatusViewModel {
    const fallbackHost = this.getConfiguredApiHost();

    return {
      health: 'checking',
      healthLabel: 'Checking',
      apiName: fallbackHost.split('.')[0] || 'api',
      apiHost: fallbackHost,
      apiVersion: 'unknown',
      environment: 'unknown',
      databaseName: 'unknown',
      databaseRole: 'unknown',
      error: ''
    };
  }

  private normalizeServiceStatusError(error: any): ServiceStatusResponse {
    if (error && error.error && typeof error.error === 'object') {
      return error.error;
    }

    return {
      status: 'degraded',
      error: error && error.message ? error.message : 'Service status unavailable.'
    };
  }

  private mapServiceStatus(status: ServiceStatusResponse): ServiceStatusViewModel {
    const fallback = this.buildCheckingStatus();
    const health =
      status && status.status === 'ok' ? 'ok' : status && status.status === 'checking' ? 'checking' : 'degraded';
    const databaseRole = String(status?.database?.role || fallback.databaseRole).toUpperCase();

    return {
      health,
      healthLabel: health === 'ok' ? 'Healthy' : health === 'checking' ? 'Checking' : 'Degraded',
      apiName: status?.service?.name || fallback.apiName,
      apiHost: status?.service?.host || fallback.apiHost,
      apiVersion: status?.service?.version || fallback.apiVersion,
      environment: status?.service?.environment || fallback.environment,
      databaseName: status?.database?.name || fallback.databaseName,
      databaseRole,
      error: status?.error || ''
    };
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.corkBoardSubscription.unsubscribe();
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
    if (this.impersonatorSubscription) {
      this.impersonatorSubscription.unsubscribe();
    }
    if (this.serviceStatusSubscription) {
      this.serviceStatusSubscription.unsubscribe();
    }
  }
}
