import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { PatientCallQuestionsComponent } from './patient-call-questions.component';
import { PatientCallQuestionsService } from './patient-call-questions.service';

const questionsMock = [
  { patientCallQuestionId: 'q1', patientCallQuestionType: 'rating', patientQuestionTypeLabel: 'rating' },
  { patientCallQuestionId: 'q2', patientCallQuestionType: 'text', patientQuestionTypeLabel: 'text' },
  { patientCallQuestionId: 'q3', patientCallQuestionType: 'rating', patientQuestionTypeLabel: 'rating' },
  { patientCallQuestionId: 'q4', patientCallQuestionType: 'rating', patientQuestionTypeLabel: 'rating' },
  { patientCallQuestionId: 'q5', patientCallQuestionType: 'rating', patientQuestionTypeLabel: 'rating' }
];

describe('PatientCallQuestionsComponent', () => {
  let component: PatientCallQuestionsComponent;
  let fixture: ComponentFixture<PatientCallQuestionsComponent>;
  const serviceStub = {
    getPatientCallQuestionsByPatientCallId: jest.fn(() => of(questionsMock)),
    getPatientCallQuestionAnswersByPatientCallQuestionId: jest.fn(() => of([{ patientCallQuestionAnswer: '4' }]))
  } as any;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [PatientCallQuestionsComponent],
        providers: [{ provide: PatientCallQuestionsService, useValue: serviceStub }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallQuestionsComponent);
    component = fixture.componentInstance;
    component.patientCall = { patientCallId: 'pc1' } as any;
    component.lastCall = { patientCallId: 'pc2' } as any;
    fixture.detectChanges();
  });

  it('builds controls for questions and populates answers', done => {
    setTimeout(() => {
      expect(component.questions.length).toBe(questionsMock.length);
      const formArray = component.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers');
      expect(formArray?.value.length).toBe(questionsMock.length);
      expect(serviceStub.getPatientCallQuestionsByPatientCallId).toHaveBeenCalledWith('pc1');
      // last call path executes answer fetch
      expect(serviceStub.getPatientCallQuestionAnswersByPatientCallQuestionId).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('sets ratings and exposes star state', () => {
    component.questions = questionsMock;
    component.createForm();
    component.addQuestionControl(questionsMock[0]);
    component.setRating('q1', 3);

    expect(component.isStarFilled(2, 'q1')).toBe(true);
    expect(component.isStarFilled(5, 'q1')).toBe(false);
  });

  it('emits answer changes via onChanges pipeline', done => {
    component.questions = questionsMock;
    component.createForm();
    component.addQuestionControl(questionsMock[0]);

    component.patientCallAnwersChangeEmitter.subscribe(values => {
      expect(values.length).toBeGreaterThan(0);
      done();
    });

    component.onChanges();
    const arr = component.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers');
    (arr as any).setValue([{ q1: 5 }]);
  });
});
