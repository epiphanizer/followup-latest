import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PatientCallQuestionsComponent } from './patient-call-questions.component';
import { PatientCallQuestionsService } from './patient-call-questions.service';

describe('PatientCallQuestionsComponent', () => {
  let component: PatientCallQuestionsComponent;
  let fixture: ComponentFixture<PatientCallQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallQuestionsComponent],
      providers: [
        {
          provide: PatientCallQuestionsService,
          useValue: { getPatientCallQuestionsByPatientCallId: jest.fn(() => of([])) }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallQuestionsComponent);
    component = fixture.componentInstance;
    component.patientCall = { patientCallId: 'pc1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
