import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNextCallFinishButtonComponent } from './patient-next-call-finish-button.component';

describe('PatientNextCallFinishButtonComponent', () => {
  let component: PatientNextCallFinishButtonComponent;
  let fixture: ComponentFixture<PatientNextCallFinishButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientNextCallFinishButtonComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientNextCallFinishButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not emit finalize when disabled', () => {
    component.disabled = true;
    component.patientCall = { patientCallId: 'pc1' } as any;
    const emitSpy = jest.spyOn(component.patientCallFinalizeEventEmitter, 'emit');

    component.finalizePatientCall(component.patientCall);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
