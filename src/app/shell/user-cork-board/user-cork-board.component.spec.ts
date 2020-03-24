import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCorkBoardComponent } from './user-cork-board.component';

describe('UserCorkBoardComponent', () => {
  let component: UserCorkBoardComponent;
  let fixture: ComponentFixture<UserCorkBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserCorkBoardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCorkBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
