import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpBackend, HttpResponse } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of } from 'rxjs';

import { AuthenticationService, CoreModule } from '@app/core';
import { UserCorkBoardService } from './user-cork-board/user-cork-board.service';

const userSubject = new BehaviorSubject<any>({ userId: 'u1', userLoginExpires: Date.now() + 10000 });
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
    component.ngOnDestroy();
    discardPeriodicTasks();
  }));
});
