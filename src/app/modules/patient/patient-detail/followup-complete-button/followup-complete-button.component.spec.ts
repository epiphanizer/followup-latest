import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupCompleteButtonComponent } from './followup-complete-button.component';

describe('FollowupCompleteButtonComponent', () => {
  let component: FollowupCompleteButtonComponent;
  let fixture: ComponentFixture<FollowupCompleteButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FollowupCompleteButtonComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowupCompleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
