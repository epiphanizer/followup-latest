import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeComponent } from './home.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SharedFunctions } from '@app/shared/shared.functions';
import { TeamService } from '@app/modules/team/team.service';
import { UserService } from '@app/modules/user/user.service';

class QuoteService {}
const mockUser = {
  userId: 'u1',
  teams: [{ teamId: 'team1' }],
  operationGroups: []
} as any;

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CoreModule, SharedModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [HomeComponent],
      providers: [
        QuoteService,
        { provide: ActivatedRoute, useValue: { snapshot: { data: { user: mockUser } } } },
        { provide: SharedFunctions, useValue: { returnHTML: (v: any) => v } },
        {
          provide: TeamService,
          useValue: {
            getTeamMessagesByTeamId: jest.fn(() => of([{ messageBody: '', teamId: 'team1' }] as any)),
            getTeamTotals: jest.fn(() => of([{ totalCalls: 0, totalNotifications: 0 }]))
          }
        },
        {
          provide: UserService,
          useValue: {
            getUserMessages: jest.fn(() => of([{ messageBody: '' }] as any)),
            getUserCallCount: jest.fn(() =>
              of([
                {
                  todaysCompletedCalls: 0,
                  todaysScheduledCalls: 0,
                  weeklyCompletedCalls: 0,
                  weeklyScheduledCalls: 0,
                  totalCalls: 0
                }
              ] as any)
            ),
            getUserNotifications: jest.fn(() => of([]))
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
