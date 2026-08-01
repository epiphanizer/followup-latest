import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallStartButtonComponent } from './patient-call-start-button.component';

describe('PatientCallStartButtonComponent', () => {
  let component: PatientCallStartButtonComponent;
  let fixture: ComponentFixture<PatientCallStartButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientCallStartButtonComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallStartButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables the start button and blocks emits', () => {
    component.user = { userId: 'u1' } as any;
    component.disabled = true;
    const emitSpy = jest.spyOn(component.patientCallStartEventEmitter, 'emit');

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);

    component.patientCallStartEvent();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
