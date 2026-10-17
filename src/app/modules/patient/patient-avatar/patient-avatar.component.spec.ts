import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PatientAvatarComponent } from './patient-avatar.component';
import { PatientAvatarService } from './patient-avatar.service';

describe('PatientAvatarComponent', () => {
  let component: PatientAvatarComponent;
  let fixture: ComponentFixture<PatientAvatarComponent>;
  let avatarServiceMock: { getPatientAvatarByPatientId: jest.Mock };
  let reader: { result: string; onloadend: () => void; readAsDataURL: jest.Mock };
  let originalFileReader: typeof FileReader;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(waitForAsync(() => {
    originalFileReader = globalThis.FileReader;
    originalIntersectionObserver = globalThis.IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;

    reader = {
      result: 'data:image/png;base64,dGVzdA==',
      onloadend: null,
      readAsDataURL: jest.fn()
    };
    globalThis.FileReader = jest.fn(() => reader) as any;

    avatarServiceMock = {
      getPatientAvatarByPatientId: jest.fn(() => of(new Blob(['avatar'])))
    };

    TestBed.configureTestingModule({
      declarations: [PatientAvatarComponent],
      providers: [
        {
          provide: PatientAvatarService,
          useValue: avatarServiceMock
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    PatientAvatarComponent.clearCache();
    fixture = TestBed.createComponent(PatientAvatarComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'test-id' } as any;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
    if (originalIntersectionObserver) {
      globalThis.IntersectionObserver = originalIntersectionObserver;
    } else {
      delete (globalThis as any).IntersectionObserver;
    }
    PatientAvatarComponent.clearCache();
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

  it('applies negative caching when the service returns null (204 No Content)', () => {
    avatarServiceMock.getPatientAvatarByPatientId.mockReturnValue(of(null));
    fixture.detectChanges();

    expect(component.avatarExists).toBe(false);
    expect(sessionStorage.getItem('test-id')).toBe('none');

    // Create a second component for the same patient - should hit negative cache and NOT call service again
    avatarServiceMock.getPatientAvatarByPatientId.mockClear();
    const fixture2 = TestBed.createComponent(PatientAvatarComponent);
    const comp2 = fixture2.componentInstance;
    comp2.patient = { patientId: 'test-id' } as any;
    fixture2.detectChanges();

    expect(comp2.avatarExists).toBe(false);
    expect(avatarServiceMock.getPatientAvatarByPatientId).not.toHaveBeenCalled();
  });

  it('applies negative caching on error response', () => {
    avatarServiceMock.getPatientAvatarByPatientId.mockReturnValue(throwError(() => new Error('Not found')));
    fixture.detectChanges();

    expect(component.avatarExists).toBe(false);
    expect(sessionStorage.getItem('test-id')).toBe('none');
  });

  it('uses cached style from sessionStorage on initialization without calling service', () => {
    sessionStorage.setItem('test-id', 'data:image/png;base64,cHJldmlvdXM=');

    fixture.detectChanges();

    expect(component.avatarExists).toBe(true);
    expect(avatarServiceMock.getPatientAvatarByPatientId).not.toHaveBeenCalled();
  });

  it('clears caches and sessionStorage with clearCache', () => {
    sessionStorage.setItem('test-id', 'data:image/png;base64,cHJldmlvdXM=');
    PatientAvatarComponent.clearCache('test-id');

    expect(sessionStorage.getItem('test-id')).toBeNull();

    fixture.detectChanges();
    expect(avatarServiceMock.getPatientAvatarByPatientId).toHaveBeenCalledWith('test-id');
  });

  it('supports lazy-loading with IntersectionObserver when available', () => {
    let observerCallback: (entries: any[]) => void;
    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();

    globalThis.IntersectionObserver = jest.fn((cb: any) => {
      observerCallback = cb;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn()
      };
    }) as any;

    const lazyFixture = TestBed.createComponent(PatientAvatarComponent);
    const lazyComp = lazyFixture.componentInstance;
    lazyComp.patient = { patientId: 'lazy-patient' } as any;

    lazyFixture.detectChanges();

    // Observer should be registered on the element
    expect(mockObserve).toHaveBeenCalled();
    // Service should NOT be called yet because element hasn't intersected
    expect(avatarServiceMock.getPatientAvatarByPatientId).not.toHaveBeenCalled();

    // Simulate element entering viewport
    observerCallback([{ isIntersecting: true }]);

    // Now service should be called
    expect(avatarServiceMock.getPatientAvatarByPatientId).toHaveBeenCalledWith('lazy-patient');
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
