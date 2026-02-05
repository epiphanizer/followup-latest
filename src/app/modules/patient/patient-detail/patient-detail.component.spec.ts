import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PatientCallService } from './patient-call/patient-call.service';

import { PatientDetailComponent } from './patient-detail.component';

describe('PatientDetailComponent', () => {
  let component: PatientDetailComponent;
  let fixture: ComponentFixture<PatientDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { patient: { patientId: 'p1', nextPatientCallId: 'pc1', patientCalls$: of([]) } },
              params: {},
              queryParams: {}
            }
          }
        },
        {
          provide: PatientCallService,
          useValue: { getPatientCallByPatientCallId: jest.fn(() => of([{ patientCallId: 'pc1' }])) }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'p1', nextPatientCallId: 'pc1', patientCalls$: of([]) } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
