import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { UserCorkBoardComponent } from './user-cork-board.component';
import { UserCorkBoardService } from './user-cork-board.service';

describe('UserCorkBoardComponent', () => {
  let component: UserCorkBoardComponent;
  let fixture: ComponentFixture<UserCorkBoardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
        declarations: [UserCorkBoardComponent],
        providers: [
          { provide: ActivatedRoute, useValue: { snapshot: { data: { user: { userId: 'u1' } } } } },
          {
            provide: UserCorkBoardService,
            useValue: {
              menuStateBSubject: new BehaviorSubject(false),
              refreshUserCorkBoardBSubject: new BehaviorSubject(false),
              isOpen: false,
              refresh: false,
              getUserCorkBoardObjectsByUserId: jest.fn(() => of([]))
            }
          }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCorkBoardComponent);
    component = fixture.componentInstance;
    component.user = { userId: 'u1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
