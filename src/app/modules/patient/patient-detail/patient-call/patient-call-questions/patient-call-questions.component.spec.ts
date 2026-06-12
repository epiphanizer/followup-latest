import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { PatientCallQuestionsComponent } from './patient-call-questions.component';
import { PatientCallQuestionsService } from './patient-call-questions.service';

const buildQuestion = (id: string, type: 'boolean' | 'rating' | 'text') => ({
  patientCallQuestionId: id,
  patientCallQuestion: `${type} question ${id}`,
  patientCallQuestionType: type,
  patientCallQuestionOrder: Number(id.replace('q', '')),
  patientCallQuestionIsHighlighted: 0,
  patientQuestionTypeLabel: type
});

const questionsMock = [
  buildQuestion('q0', 'boolean'),
  buildQuestion('q1', 'rating'),
  buildQuestion('q2', 'text'),
  buildQuestion('q3', 'rating'),
  buildQuestion('q4', 'rating'),
  buildQuestion('q5', 'rating')
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
    component.questions = [questionsMock[1]];
    component.createForm();
    component.addQuestionControl(questionsMock[1]);
    component.setRating('q1', 3);

    expect(component.isStarFilled(2, 'q1')).toBe(true);
    expect(component.isStarFilled(5, 'q1')).toBe(false);
  });

  it('renders inline yes and no checkbox options for boolean questions', done => {
    setTimeout(() => {
      const element = fixture.nativeElement as HTMLElement;
      const options = Array.from(element.querySelectorAll('ion-checkbox.boolean-option')) as HTMLElement[];

      expect(options).toHaveLength(2);
      expect(options[0].textContent).toContain('Yes');
      expect(options[1].textContent).toContain('No');
      expect(element.querySelector('.boolean-question-group')).toBeTruthy();
      done();
    }, 0);
  });

  it('keeps true and false mutually exclusive when toggled', () => {
    component.questions = [questionsMock[0]] as any;
    component.createForm();
    component.addQuestionControl(questionsMock[0] as any);

    component.onBooleanAnswerChange(0, 'q0', 'true', true);
    expect(component.isBooleanAnswer(0, 'q0', 'true')).toBe(true);
    expect(component.isBooleanAnswer(0, 'q0', 'false')).toBe(false);

    component.onBooleanAnswerChange(0, 'q0', 'false', true);
    expect(component.isBooleanAnswer(0, 'q0', 'true')).toBe(false);
    expect(component.isBooleanAnswer(0, 'q0', 'false')).toBe(true);
  });

  it('emits answer changes via onChanges pipeline', done => {
    component.questions = questionsMock;
    component.createForm();
    component.addQuestionControl(questionsMock[1]);

    component.patientCallAnwersChangeEmitter.subscribe(values => {
      expect(values.length).toBeGreaterThan(0);
      done();
    });

    component.onChanges();
    const arr = component.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers');
    (arr as any).setValue([{ q1: 5 }]);
  });
});
