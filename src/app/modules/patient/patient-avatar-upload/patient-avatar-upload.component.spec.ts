import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PatientAvatarUploadComponent } from './patient-avatar-upload.component';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';

const patientAvatarServiceStub = {
  getPatientAvatarByPatientId: jest.fn(() => of(null)),
  uploadPatientAvatarByPatientId: jest.fn(() => of(null))
};

const imageCompressStub = {
  uploadFile: jest.fn(),
  compressFile: jest.fn()
};

const toastrStub = {
  success: jest.fn()
};

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('PatientAvatarUploadComponent (Jest)', () => {
  let component: PatientAvatarUploadComponent;
  let fixture: ComponentFixture<PatientAvatarUploadComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      declarations: [PatientAvatarUploadComponent],
      providers: [
        { provide: PatientAvatarService, useValue: patientAvatarServiceStub },
        { provide: ToastrService, useValue: toastrStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(PatientAvatarUploadComponent, {
        set: {
          providers: [{ provide: NgxImageCompressService, useValue: imageCompressStub }]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PatientAvatarUploadComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'p1' } as any;
    component.avatarExists = false;
    fixture.detectChanges();
  });

  it('initializes without an existing avatar', () => {
    expect(component).toBeTruthy();
    expect(component.avatarExists).toBe(false);
  });

  it('converts base64 to blob with expected type', () => {
    const blob = component.dataURItoBlob('YWFh');

    expect(blob instanceof Blob).toBe(true);
    expect(blob.type).toBe('image/jpeg');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('uploads a compressed avatar and triggers service calls', async () => {
    const uploadSpy = jest.spyOn(patientAvatarServiceStub, 'uploadPatientAvatarByPatientId');
    const getAvatarSpy = jest.spyOn(patientAvatarServiceStub, 'getPatientAvatarByPatientId');
    imageCompressStub.uploadFile.mockResolvedValue({ image: 'data:image/jpeg;base64,AAAA', orientation: 1 });
    imageCompressStub.compressFile.mockResolvedValue('data:image/jpeg;base64,BBBB');
    patientAvatarServiceStub.getPatientAvatarByPatientId.mockReturnValue(of(null));

    component.uploadPatientAvatarPhoto();
    await fixture.whenStable();
    await flushPromises();
    await flushPromises();

    expect(imageCompressStub.uploadFile).toHaveBeenCalled();
    expect(imageCompressStub.compressFile).toHaveBeenCalledWith('data:image/jpeg;base64,AAAA', 1, 50, 50);
    expect(uploadSpy).toHaveBeenCalled();
    expect(getAvatarSpy).toHaveBeenCalled();
    expect(component.imgResultAfterCompress).toContain('BBBB');
  });
});
