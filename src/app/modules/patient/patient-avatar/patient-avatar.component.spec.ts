import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PatientAvatarComponent } from './patient-avatar.component';
import { PatientAvatarService } from './patient-avatar.service';

describe('PatientAvatarComponent', () => {
  let component: PatientAvatarComponent;
  let fixture: ComponentFixture<PatientAvatarComponent>;
  let reader: { result: string; onloadend: () => void; readAsDataURL: jest.Mock };
  let originalFileReader: typeof FileReader;

  beforeEach(waitForAsync(() => {
    originalFileReader = globalThis.FileReader;
    reader = {
      result: 'data:image/png;base64,dGVzdA==',
      onloadend: null,
      readAsDataURL: jest.fn()
    };
    globalThis.FileReader = jest.fn(() => reader) as any;

    TestBed.configureTestingModule({
      declarations: [PatientAvatarComponent],
      providers: [
        {
          provide: PatientAvatarService,
          useValue: { getPatientAvatarByPatientId: jest.fn(() => of(new Blob(['avatar']))) }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAvatarComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'test-id' } as any;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
    sessionStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('marks the avatar view for checking when the file reader finishes', () => {
    const markForCheck = jest.spyOn((component as any).changeDetectorRef, 'markForCheck');

    fixture.detectChanges();
    reader.onloadend();

    expect(component.avatarExists).toBe(true);
    expect(markForCheck).toHaveBeenCalled();
  });
});
