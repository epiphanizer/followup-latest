import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpBackend, HttpHeaders, HttpResponse } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Config, IonicModule } from '@ionic/angular';
import { BehaviorSubject, of } from 'rxjs';

import { AuthenticationService, CoreModule } from '@app/core';
import { UserCorkBoardService } from './user-cork-board/user-cork-board.service';

const userSubject = new BehaviorSubject<any>({ userId: 'u1', userLoginExpires: Date.now() + 600000 });
const impersonatorSubject = new BehaviorSubject<any>(null);
class MockAuthenticationService {
  currentUserSubject = userSubject;
  currentUser = userSubject.asObservable();
  impersonator = impersonatorSubject.asObservable();
  impersonatorValue: any = null;
  get currentUserValue() {
    return userSubject.getValue();
  }
  signOut = jest.fn();
  stopImpersonation = jest.fn();
}

import { ShellComponent } from './shell.component';

@Component({ template: '' })
class MockHomeComponent {}

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'home', component: MockHomeComponent }]),
        TranslateModule.forRoot(),
        IonicModule.forRoot(),
        CoreModule
      ],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        {
          provide: HttpBackend,
          useValue: {
            handle: jest.fn(() =>
              of(
                new HttpResponse({
                  status: 200,
                  headers: new HttpHeaders({
                    'Server-Timing': 'app;dur=18.2'
                  }),
                  body: {
                    status: 'ok',
                    service: {
                      name: 'alpha-followup-api',
                      host: 'alpha-followup-api.azurewebsites.net',
                      version: '3.11.0',
                      environment: 'prod'
                    },
                    database: {
                      name: 'followup_alpha_20260517',
                      role: 'alpha'
                    },
                    profiling: {
                      requestProfilingEnabled: true,
                      slowRequestMs: 700,
                      dbProfilingEnabled: true,
                      dbSlowQueryMs: 200,
                      databasePingMs: 4.8
                    }
                  }
                })
              )
            )
          }
        },
        {
          provide: UserCorkBoardService,
          useValue: {
            menuStateBSubject: new BehaviorSubject(false),
            isOpen: false,
            getUserCorkBoardObjectsByUserId: jest.fn(() => of([]))
          }
        },
        {
          provide: Config,
          useValue: {
            getBoolean: jest.fn(() => false),
            getNumber: jest.fn(() => 0)
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ShellComponent, MockHomeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads service status details for the footer card', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.serviceStatus.apiName).toBe('alpha-followup-api');
    expect(component.serviceStatus.databaseName).toBe('followup_alpha_20260517');
    expect(component.serviceStatus.health).toBe('ok');
    expect(component.serviceStatus.profilingSummary).toContain('API on');
    expect(component.serviceStatusPanelRendered).toBe(true);
    component.ngOnDestroy();
    discardPeriodicTasks();
  }));

  it('auto-hides a healthy status panel after the login toast window', fakeAsync(() => {
    const buildCheckingStatus = (component as any).buildCheckingStatus.bind(component);

    (component as any).statusAutoHideMs = 1;
    (component as any).statusFadeOutMs = 1;
    component.serviceStatus = {
      ...buildCheckingStatus(),
      health: 'ok',
      healthLabel: 'Healthy'
    };

    (component as any).syncServiceStatusVisibility('checking');
    expect(component.serviceStatusPanelRendered).toBe(true);

    tick(5);

    expect(component.serviceStatusPanelRendered).toBe(false);
  }));

  it('filters and scopes the version change log to markdown-backed versions only', () => {
    expect(component.filteredChangeLogVersions.map(release => release.version)).toEqual([
      '3.11.0',
      '3.10.0-rc3',
      '3.10.0'
    ]);

    component.changeLogVersionQuery = 'rc3';
    expect(component.filteredChangeLogVersions.map(release => release.version)).toEqual(['3.10.0-rc3']);

    component.selectChangeLogVersion('3.10.0-rc3');
    expect(component.visibleChangeLogReleases.map(release => release.version)).toEqual(['3.11.0', '3.10.0-rc3']);
  });

  it('keeps a degraded status panel visible instead of auto-hiding', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    (component as any).statusAutoHideMs = 1;
    (component as any).statusFadeOutMs = 1;
    component.serviceStatus = {
      ...component.serviceStatus,
      health: 'degraded',
      healthLabel: 'Degraded',
      error: 'Service status unavailable.'
    };
    component.serviceStatusPanelRendered = false;
    component.serviceStatusPanelVisible = false;
    component.serviceStatusPanelPinned = false;

    (component as any).syncServiceStatusVisibility('ok');
    expect(component.serviceStatusPanelRendered).toBe(true);
    expect(component.serviceStatusPanelVisible).toBe(true);

    tick(5);

    expect(component.serviceStatusPanelRendered).toBe(true);
    component.ngOnDestroy();
    discardPeriodicTasks();
  }));

  it('toggles the pinned service status panel and change log drawer', () => {
    component.toggleServiceStatusPanel();

    expect(component.serviceStatusPanelPinned).toBe(true);
    expect(component.serviceStatusPanelRendered).toBe(true);
    expect(component.serviceStatusPanelVisible).toBe(true);

    component.toggleChangeLog();

    expect(component.changeLogExpanded).toBe(true);
    expect(component.serviceStatusPanelPinned).toBe(true);

    component.toggleServiceStatusPanel();

    expect(component.serviceStatusPanelPinned).toBe(false);
    expect(component.changeLogExpanded).toBe(false);
    expect(component.serviceStatusPanelVisible).toBe(false);
  });

  it('opens the service change log directly from the admin jump action', () => {
    component.handleServiceHealthRequest('change-log');

    expect(component.serviceStatusPanelPinned).toBe(true);
    expect(component.serviceStatusPanelRendered).toBe(true);
    expect(component.serviceStatusPanelVisible).toBe(true);
    expect(component.changeLogExpanded).toBe(true);
  });

  it('tears down safely before subscriptions are initialized', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
