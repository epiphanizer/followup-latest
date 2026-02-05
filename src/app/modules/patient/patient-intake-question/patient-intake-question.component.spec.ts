import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIntakeQuestionComponent } from './patient-intake-question.component';

describe('PatientIntakeQuestionComponent (Jest)', () => {
  let component: PatientIntakeQuestionComponent;
  let fixture: ComponentFixture<PatientIntakeQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientIntakeQuestionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientIntakeQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });
});
