import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeComponent } from './home.component';
import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SharedFunctions } from '@app/shared/shared.functions';
import { TeamService } from '@app/modules/team/team.service';
import { UserService } from '@app/modules/user/user.service';
import { AuthenticationService } from '@app/core/authentication/auth.service';

class QuoteService {}
const mockUser = {
  userId: 'u1',
  teams: [{ teamId: 'team1' }],
  operationGroups: []
} as any;
const mockUserSubject = new BehaviorSubject(mockUser);
const teamServiceMock = {
  getTeamMessagesByTeamId: jest.fn(),
  getTeamTotals: jest.fn()
};
const userServiceMock = {
  getUserMessages: jest.fn(),
  getUserCallCount: jest.fn(),
  getUserNotifications: jest.fn()
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const createComponent = () => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async(() => {
    jest.clearAllMocks();

    teamServiceMock.getTeamMessagesByTeamId.mockReturnValue(of([{ messageBody: '', teamId: 'team1' }] as any));
    teamServiceMock.getTeamTotals.mockReturnValue(of([{ totalCalls: 40, totalNotifications: 10 }]));
    userServiceMock.getUserMessages.mockReturnValue(of([{ messageBody: '' }] as any));
    userServiceMock.getUserCallCount.mockReturnValue(
      of([
        {
          todaysCompletedCalls: 3,
          todaysScheduledCalls: 6,
          weeklyCompletedCalls: 8,
          weeklyScheduledCalls: 10,
          totalCalls: 20
        }
      ] as any)
    );

    const today = new Date();
    const daysAgo = (numDays: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() - numDays);
      return date.toISOString();
    };

    userServiceMock.getUserNotifications.mockReturnValue(
      of([
        { notificationCreatedTime: daysAgo(2) },
        { notificationCreatedTime: daysAgo(5) },
        { notificationCreatedTime: daysAgo(8) },
        { notificationCreatedTime: daysAgo(20) }
      ])
    );

    TestBed.overrideComponent(HomeComponent, {
      set: {
        providers: [
          { provide: UserService, useValue: userServiceMock },
          { provide: SharedFunctions, useValue: { returnHTML: (v: any) => v } }
        ]
      }
    });

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CoreModule, SharedModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [HomeComponent],
      providers: [
        QuoteService,
        { provide: ActivatedRoute, useValue: { snapshot: { data: { user: mockUser } } } },
        { provide: SharedFunctions, useValue: { returnHTML: (v: any) => v } },
        { provide: TeamService, useValue: teamServiceMock },
        { provide: UserService, useValue: userServiceMock },
        {
          provide: AuthenticationService,
          useValue: {
            currentUserValue: mockUser,
            currentUser: mockUserSubject.asObservable()
          }
        }
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('calculates dashboard percentages from weekly and total metrics', () => {
    createComponent();

    expect(component.notificationsProgress).toBe(40);
    expect(component.todaysCallsProgress).toBe(50);
    expect(component.weeklyCallsProgress).toBe(80);
    expect(component.callsMadeProgress).toBe(50);
    expect(component.weeklyCallsToNotificationsPercentage).toBe(25);
    expect(component.totalCallsToNotificationsPercentage).toBe(25);
    expect(component.countReady).toBe(true);
  });

  it('returns zero percentages when denominator values are zero', () => {
    teamServiceMock.getTeamTotals.mockReturnValue(of([{ totalCalls: 0, totalNotifications: 0 }]));
    userServiceMock.getUserCallCount.mockReturnValue(
      of([
        {
          todaysCompletedCalls: 3,
          todaysScheduledCalls: 0,
          weeklyCompletedCalls: 4,
          weeklyScheduledCalls: 0,
          totalCalls: 0
        }
      ] as any)
    );
    userServiceMock.getUserNotifications.mockReturnValue(of([]));

    createComponent();

    expect(component.notificationsProgress).toBe(0);
    expect(component.todaysCallsProgress).toBe(0);
    expect(component.weeklyCallsProgress).toBe(0);
    expect(component.callsMadeProgress).toBe(0);
    expect(component.weeklyCallsToNotificationsPercentage).toBe(0);
    expect(component.totalCallsToNotificationsPercentage).toBe(0);
  });
});
