import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ModalController } from '@ionic/angular';

import { FollowupCompleteModalComponent } from './followup-complete-modal.component';
import { PatientStatusService } from '../../patient-status.service';

describe('FollowupCompleteModalComponent', () => {
  let component: FollowupCompleteModalComponent;
  let fixture: ComponentFixture<FollowupCompleteModalComponent>;
  const patientStatusServiceStub = {
    getPatientStatusLabels: jest.fn(() =>
      of([
        { patientStatusLabelId: '1', patientStatusLabel: 'Completed' },
        { patientStatusLabelId: '2', patientStatusLabel: 'Hospice' }
      ])
    ),
    addPatientStatusByPatientId: jest.fn(() => of({ saved: true }))
  } as any;
  const modalControllerStub = {
    dismiss: jest.fn()
  } as any;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [FollowupCompleteModalComponent],
        providers: [
          { provide: PatientStatusService, useValue: patientStatusServiceStub },
          { provide: ModalController, useValue: modalControllerStub }
        ]
      })
        .overrideComponent(FollowupCompleteModalComponent, {
          set: {
            providers: [{ provide: PatientStatusService, useValue: patientStatusServiceStub }]
          }
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowupCompleteModalComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'p1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.completionTypesLoading).toBe(false);
    expect(component.completionTypesError).toBeNull();
  });

  it('renders completion options, notes field, and actions when a patient is present', () => {
    component.completionTypes = [
      { patientStatusLabelId: '1', patientStatusLabel: 'Completed' },
      { patientStatusLabelId: '2', patientStatusLabel: 'Hospice' }
    ] as any;
    component.completionTypesLoading = false;
    component.completionTypesError = null;
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.followup-complete-shell')).toBeTruthy();
    expect(element.querySelectorAll('.status-option').length).toBe(2);
    expect(element.querySelectorAll('ion-checkbox.status-checkbox').length).toBe(2);
    expect(element.querySelector('ion-textarea.completion-notes')).toBeTruthy();
    expect(element.querySelector('.send-container .primary.button')).toBeTruthy();
    expect(element.querySelector('.send-container .secondary.button')).toBeTruthy();
  });

  it('keeps completion selections mutually exclusive', () => {
    component.onCompletionTypeChange('1', true);
    expect(component.isCompletionTypeSelected('1')).toBe(true);
    expect(component.isCompletionTypeSelected('2')).toBe(false);

    component.onCompletionTypeChange('2', true);
    expect(component.isCompletionTypeSelected('1')).toBe(false);
    expect(component.isCompletionTypeSelected('2')).toBe(true);
  });

  it('stops loading and records an error when completion options fail to load', () => {
    patientStatusServiceStub.getPatientStatusLabels.mockReturnValueOnce(throwError(() => new Error('boom')));

    const errorFixture = TestBed.createComponent(FollowupCompleteModalComponent);
    const errorComponent = errorFixture.componentInstance;
    errorComponent.patient = { patientId: 'p2' } as any;

    errorFixture.detectChanges();

    expect(errorComponent.followupCompleteForm).toBeTruthy();
    expect(errorComponent.completionTypesLoading).toBe(false);
    expect(errorComponent.completionTypes).toEqual([]);
    expect(errorComponent.completionTypesError).toBe('Unable to load completion options.');
  });
});
