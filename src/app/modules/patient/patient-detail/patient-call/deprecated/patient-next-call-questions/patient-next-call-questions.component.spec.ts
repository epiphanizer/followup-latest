import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNextCallQuestionsComponent } from './patient-next-call-questions.component';

describe('PatientNextCallQuestionsComponent', () => {
  let component: PatientNextCallQuestionsComponent;
  let fixture: ComponentFixture<PatientNextCallQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientNextCallQuestionsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientNextCallQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
