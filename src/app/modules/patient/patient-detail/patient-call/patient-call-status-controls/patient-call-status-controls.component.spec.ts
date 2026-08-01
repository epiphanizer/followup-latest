import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PatientCallStatusControlsComponent } from './patient-call-status-controls.component';
import { PatientCallStatusService } from '../patient-call-status.service';

describe('PatientCallStatusControlsComponent', () => {
  let component: PatientCallStatusControlsComponent;
  let fixture: ComponentFixture<PatientCallStatusControlsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientCallStatusControlsComponent],
        providers: [
          {
            provide: PatientCallStatusService,
            useValue: {
              getPatientCallStatuses: jest.fn(() => of([]))
            }
          }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallStatusControlsComponent);
    component = fixture.componentInstance;
    component.patientCall = { patientCallStatusLabel: 'Pending', patientCallId: 'pc1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not emit status changes when disabled', () => {
    component.patientCall = { patientCallStatusLabel: 'Started', patientCallId: 'pc1' } as any;
    component.disabled = true;
    const statusSpy = jest.spyOn(component.patientCallStatusChangeEmitter, 'emit');
    const finalSpy = jest.spyOn(component.patientFinalCallStatusChangeEmitter, 'emit');

    component.updatePatientCallStatus(1 as any);
    component.updateFinalCallStatus();

    expect(statusSpy).not.toHaveBeenCalled();
    expect(finalSpy).not.toHaveBeenCalled();
  });
});
