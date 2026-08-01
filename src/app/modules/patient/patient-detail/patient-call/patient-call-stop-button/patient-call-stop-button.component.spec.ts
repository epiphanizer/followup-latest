import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PatientCallStopButtonComponent } from './patient-call-stop-button.component';
import { PatientCallService } from '../patient-call.service';

describe('PatientCallStopButtonComponent', () => {
  let component: PatientCallStopButtonComponent;
  let fixture: ComponentFixture<PatientCallStopButtonComponent>;
  const patientCallServiceMock = {
    endPatientCall: jest.fn(() => of({ patientCallId: 'pc1' }))
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientCallStopButtonComponent],
        providers: [{ provide: PatientCallService, useValue: patientCallServiceMock }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
    fixture = TestBed.createComponent(PatientCallStopButtonComponent);
    component = fixture.componentInstance;
    component.patientCall = { patientCallId: 'pc1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not stop the call when disabled', () => {
    component.disabled = true;
    const emitSpy = jest.spyOn(component.patientCallEndEventEmitter, 'emit');

    component.stopPatientCall();

    expect(patientCallServiceMock.endPatientCall).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
