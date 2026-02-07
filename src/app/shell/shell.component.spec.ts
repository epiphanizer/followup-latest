import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), IonicModule.forRoot(), CoreModule],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
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
      declarations: [ShellComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
