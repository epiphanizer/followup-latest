import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { HostListener } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { of, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';
import { UserCorkBoardService } from './user-cork-board/user-cork-board.service';
import { SERVICE_HEALTH_CHANGE_LOG, ServiceHealthChangeLogRelease } from './service-health-change-log.data';

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
  profiling?: {
    uptimeSeconds?: number;
    requestProfilingEnabled?: boolean;
    slowRequestMs?: number;
    dbProfilingEnabled?: boolean;
    dbSlowQueryMs?: number;
    databasePingMs?: number;
  };
  checkedAt?: string;
  error?: string;
}

interface ServiceStatusRequestResult {
  status: ServiceStatusResponse;
  apiRoundTripMs: number;
  apiServerTimingMs: number;
}

interface ServiceStatusPanelPosition {
  top: number;
  left: number;
}

interface ServiceStatusDragState {
  pointerStartX: number;
  pointerStartY: number;
  panelStartLeft: number;
  panelStartTop: number;
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
  latencySummary: string;
  profilingSummary: string;
  checkedAtLabel: string;
  error: string;
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  standalone: false
})
export class ShellComponent {
  private readonly userIdleTimeoutMs = 15 * 60 * 1000;
  private readonly idleWarningThresholdMs = 30 * 1000;
  private readonly statusRefreshMs = 60000;
  private readonly statusAutoHideMs = 5000;
  private readonly statusFadeOutMs = 250;
  private readonly statusViewportPaddingPx = 12;
  private readonly statusHttp: HttpClient;
  @ViewChild('serviceStatusPanel') serviceStatusPanelRef: ElementRef<HTMLDivElement>;
  corkboardExpanded: boolean = false;
  corkBoardSubscription: Subscription;
  dropdownActive: Boolean = false;
  idleLogoutTimer: ReturnType<typeof setInterval>;
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
  serviceStatusPanelPinned: boolean = false;
  serviceStatusPanelRendered: boolean = false;
  serviceStatusPanelVisible: boolean = false;
  serviceStatusPosition: ServiceStatusPanelPosition = null;
  readonly serviceHealthChangeLog: ServiceHealthChangeLogRelease[] = SERVICE_HEALTH_CHANGE_LOG;
  selectedChangeLogVersion: string = '';
  changeLogVersionQuery: string = '';
  changeLogExpanded: boolean = false;
  private serviceStatusAutoHideTimeout: ReturnType<typeof setTimeout>;
  private serviceStatusFadeOutTimeout: ReturnType<typeof setTimeout>;
  private serviceStatusDragState: ServiceStatusDragState = null;
  private serviceStatusHasAutoShown: boolean = false;

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
    this.stopServiceStatusDrag();
    this.serviceStatusPosition = null;
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    this.markUserActivity();
    this.updateServiceStatusDrag(e && e.clientX, e && e.clientY);
  }
  @HostListener('document:mousedown')
  onMouseDown() {
    this.markUserActivity();
  }
  @HostListener('document:touchstart', ['$event'])
  onTouchStart(e: any) {
    this.markUserActivity();
  }
  @HostListener('document:touchmove', ['$event'])
  onTouchMove(e: any) {
    this.markUserActivity();
    const touchPoint = this.getTouchPoint(e);
    if (touchPoint) {
      this.updateServiceStatusDrag(touchPoint.clientX, touchPoint.clientY);
    }
  }
  @HostListener('window:wheel')
  onWheel() {
    this.markUserActivity();
  }
  @HostListener('document:mouseup')
  onMouseUp() {
    this.stopServiceStatusDrag();
  }
  @HostListener('document:touchend')
  onTouchEnd() {
    this.stopServiceStatusDrag();
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: any) {
    this.markUserActivity();
  }

  private markUserActivity() {
    this.updateUserExpiry();
  }

  updateUserExpiry() {
    /**
     * Updates our expire time within the shell component
     */
    this.user = this.authenticationService.currentUserSubject.getValue();
    if (!this.user) {
      return;
    }

    var date = new Date();
    this.user.userLoginExpires = date.getTime() + this.userIdleTimeoutMs;
    this.authenticationService.currentUserSubject.next(this.user);
    localStorage.removeItem('followup-user');
    localStorage.setItem('followup-user', JSON.stringify(this.user));
    this.userActionSinceLastUpdate = false;
  }
  setIdleLogoutTimer() {
    var self = this;
    this.idleLogoutTimer = setInterval(function() {
      self.user = self.authenticationService.currentUserSubject.getValue();
      if (!self.user || !self.user.userLoginExpires) {
        return;
      }

      var date = new Date();
      var currentTime = date.getTime();
      var timeRemaining = Math.round((self.user.userLoginExpires - currentTime) / 1000);
      if (self.user.userLoginExpires - currentTime < self.idleWarningThresholdMs) {
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
  toggleServiceStatusPanel() {
    if (this.serviceStatusPanelVisible && this.serviceStatusPanelPinned) {
      this.closeServiceStatusPanel();
      return;
    }

    this.openServiceStatusPanel(true);
  }

  handleServiceHealthRequest(mode: 'panel' | 'change-log' = 'panel') {
    if (mode === 'change-log') {
      this.serviceStatusPanelPinned = true;
      this.changeLogExpanded = true;
      this.openServiceStatusPanel(true);
      return;
    }

    this.toggleServiceStatusPanel();
  }

  closeServiceStatusPanel() {
    this.serviceStatusPanelPinned = false;
    this.changeLogExpanded = false;
    this.hideServiceStatusPanel();
  }

  toggleChangeLog() {
    this.changeLogExpanded = !this.changeLogExpanded;

    if (this.changeLogExpanded) {
      this.openServiceStatusPanel(true);
    }
  }

  updateChangeLogVersionQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.changeLogVersionQuery = input && typeof input.value === 'string' ? input.value : '';
  }

  selectChangeLogVersion(version: string) {
    this.selectedChangeLogVersion = this.selectedChangeLogVersion === version ? '' : version;
    this.openServiceStatusPanel(true);
  }

  get filteredChangeLogVersions(): ServiceHealthChangeLogRelease[] {
    const normalizedQuery = this.changeLogVersionQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.serviceHealthChangeLog;
    }

    return this.serviceHealthChangeLog.filter(release => {
      return (
        release.version.toLowerCase().indexOf(normalizedQuery) >= 0 ||
        release.label.toLowerCase().indexOf(normalizedQuery) >= 0 ||
        release.recordedAt.toLowerCase().indexOf(normalizedQuery) >= 0
      );
    });
  }

  get visibleChangeLogReleases(): ServiceHealthChangeLogRelease[] {
    if (!this.selectedChangeLogVersion) {
      return this.serviceHealthChangeLog;
    }

    return this.serviceHealthChangeLog.filter(release => release.version === this.selectedChangeLogVersion);
  }

  get changeLogSummary(): string {
    if (!this.selectedChangeLogVersion) {
      return 'Showing all ' + this.serviceHealthChangeLog.length + ' recorded releases.';
    }

    const releaseCount = this.visibleChangeLogReleases.length;
    return (
      'Showing ' +
      releaseCount +
      ' recorded release' +
      (releaseCount === 1 ? '' : 's') +
      ' for v' +
      this.selectedChangeLogVersion +
      '.'
    );
  }
  signOut() {
    this.authenticationService.signOut(this.user.userId);
    this.router.navigate(['/login']);
  }

  stopImpersonation() {
    this.authenticationService.stopImpersonation();
  }

  private startServiceStatusPolling() {
    this.serviceStatusSubscription = timer(0, this.statusRefreshMs)
      .pipe(
        switchMap(() => {
          const requestStartedAt = Date.now();
          const headers = this.buildServiceStatusHeaders();

          return this.statusHttp
            .get<ServiceStatusResponse>(this.getServiceStatusUrl(), {
              headers,
              observe: 'response'
            })
            .pipe(
              map((response: HttpResponse<ServiceStatusResponse>) =>
                this.buildServiceStatusRequestResult(response, requestStartedAt)
              ),
              catchError(error => of(this.normalizeServiceStatusError(error, requestStartedAt)))
            );
        })
      )
      .subscribe((statusResult: ServiceStatusRequestResult) => {
        const previousHealth = this.serviceStatus ? this.serviceStatus.health : 'checking';
        this.serviceStatus = this.mapServiceStatus(statusResult);
        this.syncServiceStatusVisibility(previousHealth);
        this._cdr.markForCheck();
      });
  }

  private buildServiceStatusHeaders(): HttpHeaders {
    const headerValues: Record<string, string> = {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    };
    const token = this.authenticationService.getToken();

    if (token) {
      headerValues.Authorization = `Bearer ${token}`;
    }

    return new HttpHeaders(headerValues);
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
      latencySummary: 'Awaiting first status check',
      profilingSummary: 'API n/a · DB n/a',
      checkedAtLabel: 'n/a',
      error: ''
    };
  }

  private buildServiceStatusRequestResult(
    response: HttpResponse<ServiceStatusResponse>,
    requestStartedAt: number
  ): ServiceStatusRequestResult {
    return {
      status: response.body || {},
      apiRoundTripMs: this.roundDurationMs(Date.now() - requestStartedAt),
      apiServerTimingMs: this.parseServerTimingHeader(response.headers.get('Server-Timing'))
    };
  }

  private normalizeServiceStatusError(error: any, requestStartedAt: number): ServiceStatusRequestResult {
    const normalizedStatus =
      error && error.error && typeof error.error === 'object'
        ? error.error
        : {
            status: 'degraded',
            error: error && error.message ? error.message : 'Service status unavailable.'
          };

    return {
      status: normalizedStatus,
      apiRoundTripMs: this.roundDurationMs(Date.now() - requestStartedAt),
      apiServerTimingMs: this.parseServerTimingHeader(
        error && error.headers && typeof error.headers.get === 'function' ? error.headers.get('Server-Timing') : null
      )
    };
  }

  private mapServiceStatus(statusResult: ServiceStatusRequestResult): ServiceStatusViewModel {
    const status = statusResult.status;

    const fallback = this.buildCheckingStatus();
    const health =
      status && status.status === 'ok' ? 'ok' : status && status.status === 'checking' ? 'checking' : 'degraded';
    const databaseRole = String(status?.database?.role || fallback.databaseRole).toUpperCase();
    const databasePingMs = this.roundDurationMs(status?.profiling?.databasePingMs);
    const latencySummary = this.buildLatencySummary(
      statusResult.apiRoundTripMs,
      statusResult.apiServerTimingMs,
      databasePingMs
    );
    const profilingSummary = this.buildProfilingSummary(status);

    return {
      health,
      healthLabel: health === 'ok' ? 'Healthy' : health === 'checking' ? 'Checking' : 'Degraded',
      apiName: status?.service?.name || fallback.apiName,
      apiHost: status?.service?.host || fallback.apiHost,
      apiVersion: status?.service?.version || fallback.apiVersion,
      environment: status?.service?.environment || fallback.environment,
      databaseName: status?.database?.name || fallback.databaseName,
      databaseRole,
      latencySummary,
      profilingSummary,
      checkedAtLabel: this.buildCheckedAtLabel(status?.checkedAt),
      error: status?.error || ''
    };
  }

  private buildLatencySummary(apiRoundTripMs: number, apiServerTimingMs: number, databasePingMs: number): string {
    const metrics = ['RTT ' + this.formatDuration(apiRoundTripMs)];

    if (apiServerTimingMs > 0) {
      metrics.push('App ' + this.formatDuration(apiServerTimingMs));
    }

    if (databasePingMs > 0) {
      metrics.push('DB ' + this.formatDuration(databasePingMs));
    }

    return metrics.join(' · ');
  }

  private buildProfilingSummary(status: ServiceStatusResponse): string {
    const requestEnabled = !!status?.profiling?.requestProfilingEnabled;
    const dbEnabled = !!status?.profiling?.dbProfilingEnabled;

    return [
      'API ' + (requestEnabled ? 'on' : 'off') + ' @ ' + this.formatDuration(status?.profiling?.slowRequestMs),
      'DB ' + (dbEnabled ? 'on' : 'off') + ' @ ' + this.formatDuration(status?.profiling?.dbSlowQueryMs)
    ].join(' · ');
  }

  private buildCheckedAtLabel(checkedAt: string): string {
    if (!checkedAt) {
      return 'n/a';
    }

    const checkedAtDate = new Date(checkedAt);
    if (isNaN(checkedAtDate.getTime())) {
      return 'n/a';
    }

    return checkedAtDate.toLocaleTimeString();
  }

  private formatDuration(durationMs: number): string {
    const roundedDuration = this.roundDurationMs(durationMs);
    return roundedDuration > 0 ? roundedDuration + ' ms' : 'n/a';
  }

  private roundDurationMs(durationMs: number): number {
    return Math.round(Number(durationMs || 0) * 10) / 10;
  }

  private parseServerTimingHeader(serverTimingHeader: string): number {
    if (!serverTimingHeader) {
      return 0;
    }

    const timingMatch = serverTimingHeader.match(/dur=([0-9.]+)/i);
    return timingMatch ? this.roundDurationMs(parseFloat(timingMatch[1])) : 0;
  }

  private syncServiceStatusVisibility(previousHealth: 'checking' | 'ok' | 'degraded') {
    if (!this.serviceStatus) {
      return;
    }

    if (this.serviceStatus.health === 'degraded') {
      this.openServiceStatusPanel(false);
      return;
    }

    if (this.serviceStatusPanelPinned) {
      this.openServiceStatusPanel(true);
      return;
    }

    if (
      this.serviceStatus.health === 'ok' &&
      (!this.serviceStatusHasAutoShown || previousHealth === 'degraded' || previousHealth === 'checking')
    ) {
      this.serviceStatusHasAutoShown = true;
      this.openServiceStatusPanel(false);
      this.scheduleServiceStatusAutoHide();
    }
  }

  private openServiceStatusPanel(pinOpen: boolean) {
    this.clearServiceStatusPanelTimers();
    this.serviceStatusPanelPinned = pinOpen;
    this.serviceStatusPanelRendered = true;
    this.serviceStatusPanelVisible = true;
  }

  private hideServiceStatusPanel() {
    this.clearServiceStatusPanelTimers();
    this.serviceStatusPanelVisible = false;
    this.changeLogExpanded = false;
    this.serviceStatusFadeOutTimeout = setTimeout(() => {
      if (!this.serviceStatusPanelVisible) {
        this.serviceStatusPanelRendered = false;
        this._cdr.markForCheck();
      }
    }, this.statusFadeOutMs);
  }

  private scheduleServiceStatusAutoHide() {
    this.clearServiceStatusPanelTimers();
    this.serviceStatusAutoHideTimeout = setTimeout(() => {
      if (!this.serviceStatusPanelPinned && this.serviceStatus && this.serviceStatus.health === 'ok') {
        this.hideServiceStatusPanel();
        this._cdr.markForCheck();
      }
    }, this.statusAutoHideMs);
  }

  private clearServiceStatusPanelTimers() {
    if (this.serviceStatusAutoHideTimeout) {
      clearTimeout(this.serviceStatusAutoHideTimeout);
      this.serviceStatusAutoHideTimeout = null;
    }

    if (this.serviceStatusFadeOutTimeout) {
      clearTimeout(this.serviceStatusFadeOutTimeout);
      this.serviceStatusFadeOutTimeout = null;
    }
  }

  startServiceStatusDrag(event: MouseEvent | TouchEvent) {
    if (!this.serviceStatusPanelRef) {
      return;
    }

    const pointer = this.getPointerPoint(event);
    if (!pointer) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();

    const panelBounds = this.serviceStatusPanelRef.nativeElement.getBoundingClientRect();
    this.serviceStatusPosition = {
      top: panelBounds.top,
      left: panelBounds.left
    };
    this.serviceStatusDragState = {
      pointerStartX: pointer.clientX,
      pointerStartY: pointer.clientY,
      panelStartLeft: panelBounds.left,
      panelStartTop: panelBounds.top
    };
  }

  private updateServiceStatusDrag(pointerX: number, pointerY: number) {
    if (!this.serviceStatusDragState || !this.serviceStatusPanelRef) {
      return;
    }

    const panelElement = this.serviceStatusPanelRef.nativeElement;
    const nextLeft = this.clampPosition(
      this.serviceStatusDragState.panelStartLeft + (pointerX - this.serviceStatusDragState.pointerStartX),
      this.statusViewportPaddingPx,
      Math.max(
        this.statusViewportPaddingPx,
        window.innerWidth - panelElement.offsetWidth - this.statusViewportPaddingPx
      )
    );
    const nextTop = this.clampPosition(
      this.serviceStatusDragState.panelStartTop + (pointerY - this.serviceStatusDragState.pointerStartY),
      this.statusViewportPaddingPx,
      Math.max(
        this.statusViewportPaddingPx,
        window.innerHeight - panelElement.offsetHeight - this.statusViewportPaddingPx
      )
    );

    this.serviceStatusPosition = {
      top: nextTop,
      left: nextLeft
    };
    this._cdr.markForCheck();
  }

  private stopServiceStatusDrag() {
    this.serviceStatusDragState = null;
  }

  private clampPosition(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private getPointerPoint(event: MouseEvent | TouchEvent): MouseEvent | Touch {
    if ((event as TouchEvent).touches && (event as TouchEvent).touches.length) {
      return (event as TouchEvent).touches[0];
    }

    return event as MouseEvent;
  }

  private getTouchPoint(event: TouchEvent): Touch {
    if (!event || !event.touches || !event.touches.length) {
      return null;
    }

    return event.touches[0];
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.corkBoardSubscription) {
      this.corkBoardSubscription.unsubscribe();
    }
    if (this.idleLogoutTimer) {
      clearInterval(this.idleLogoutTimer);
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
    if (this.impersonatorSubscription) {
      this.impersonatorSubscription.unsubscribe();
    }
    if (this.serviceStatusSubscription) {
      this.serviceStatusSubscription.unsubscribe();
    }
    this.clearServiceStatusPanelTimers();
  }
}
