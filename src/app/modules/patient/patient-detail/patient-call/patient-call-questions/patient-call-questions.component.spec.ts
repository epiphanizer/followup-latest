import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallQuestionsComponent } from './patient-call-questions.component';

describe('PatientCallQuestionsComponent', () => {
  let component: PatientCallQuestionsComponent;
  let fixture: ComponentFixture<PatientCallQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallQuestionsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
