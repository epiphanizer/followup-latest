import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallStopButtonComponent } from './patient-call-stop-button.component';

describe('PatientCallStopButtonComponent', () => {
  let component: PatientCallStopButtonComponent;
  let fixture: ComponentFixture<PatientCallStopButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientCallStopButtonComponent]
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

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('emits the current patient call when enabled', () => {
    const emitSpy = jest.spyOn(component.patientCallEndEventEmitter, 'emit');

    component.stopPatientCall();

    expect(emitSpy).toHaveBeenCalledWith(component.patientCall);
  });
});
