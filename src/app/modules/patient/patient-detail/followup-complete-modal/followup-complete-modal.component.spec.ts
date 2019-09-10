import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupCompleteModalComponent } from './followup-complete-modal.component';

describe('FollowupCompleteModalComponent', () => {
  let component: FollowupCompleteModalComponent;
  let fixture: ComponentFixture<FollowupCompleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FollowupCompleteModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowupCompleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
