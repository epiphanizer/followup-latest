import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PatientHistoryListingComponent } from './patient-history-listing.component';
import { PatientCallQuestionsService } from '@app/modules/patient/patient-detail/patient-call/patient-call-questions/patient-call-questions.service';
import { SharedFunctions } from '@app/shared/shared.functions';

describe('PatientHistoryListingComponent (Jest)', () => {
  let component: PatientHistoryListingComponent;
  let fixture: ComponentFixture<PatientHistoryListingComponent>;

  const patientCallQuestionsServiceStub = {
    getPatientCallQuestionsByPatientCallId: jest.fn(() => of([])),
    getPatientCallQuestionAnswersByPatientCallQuestionId: jest.fn(() => of([]))
  };

  const sharedFunctionsStub = {
    returnHTML: jest.fn((val: string) => val)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientHistoryListingComponent],
      providers: [
        { provide: PatientCallQuestionsService, useValue: patientCallQuestionsServiceStub },
        { provide: SharedFunctions, useValue: sharedFunctionsStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientHistoryListingComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'p1' } as any;
    component.patientCalls = [
      {
        patientCallId: 'c1',
        patientCallNotes: '<p>note</p>',
        patientCallStartTime: '2020-01-02T00:00:00Z',
        patientCallQuestions: []
      }
    ] as any;
    component.patientNotifications = [
      {
        notificationCreatedTime: '2020-01-03T00:00:00Z',
        notificationMessage: '<p>n</p>'
      }
    ] as any;
    fixture.detectChanges();
  });

  it('combines patient calls and notifications into activity', () => {
    expect(component).toBeTruthy();
    expect(component.patientActivity.length).toBe(2);
  });
});
