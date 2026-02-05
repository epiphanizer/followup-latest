import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ReviewPatientNextCallQuestionsComponent } from './review-patient-call-questions.component';

describe('ReviewPatientNextCallQuestionsComponent (Jest)', () => {
  let component: ReviewPatientNextCallQuestionsComponent;
  let fixture: ComponentFixture<ReviewPatientNextCallQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewPatientNextCallQuestionsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewPatientNextCallQuestionsComponent);
    component = fixture.componentInstance;
    component.patientCallQuestions = [] as any;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });
});
