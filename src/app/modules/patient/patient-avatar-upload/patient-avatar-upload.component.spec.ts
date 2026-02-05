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

describe('PatientAvatarUploadComponent (Jest)', () => {
  let component: PatientAvatarUploadComponent;
  let fixture: ComponentFixture<PatientAvatarUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientAvatarUploadComponent],
      providers: [
        { provide: PatientAvatarService, useValue: patientAvatarServiceStub },
        { provide: NgxImageCompressService, useValue: imageCompressStub },
        { provide: ToastrService, useValue: toastrStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

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
});
