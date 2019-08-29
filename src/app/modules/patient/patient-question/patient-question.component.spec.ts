import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQuestionComponent } from './patient-question.component';

describe('PatientQuestionComponent', () => {
  let component: PatientQuestionComponent;
  let fixture: ComponentFixture<PatientQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientQuestionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
