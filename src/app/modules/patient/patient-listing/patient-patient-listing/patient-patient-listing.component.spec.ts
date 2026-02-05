import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PatientPatientListingComponent } from './patient-patient-listing.component';
import { PatientService } from '@app/modules/patient/patient.service';

const patientServiceStub = {
  getPatientsByOperationId: jest.fn(() =>
    of([
      {
        patientId: 'p1',
        patientFirstName: 'Pat',
        patientLastName: 'Smith',
        patientDischargeDate: '2020-01-01',
        patientMedicalRecordNumber: '123',
        patientGender: 'M',
        patientStatusLabel: 'Active',
        patientGraduated: 0,
        patientOperationId: 'op1'
      }
    ])
  ),
  getActiveSpanishPatients: jest.fn(() => of([]))
};

describe('PatientPatientListingComponent (Jest)', () => {
  let component: PatientPatientListingComponent;
  let fixture: ComponentFixture<PatientPatientListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientPatientListingComponent],
      providers: [{ provide: PatientService, useValue: patientServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPatientListingComponent);
    component = fixture.componentInstance;
    component.mode = { spanish: false } as any;
    component.operation = { operationId: 'op1' } as any;
    fixture.detectChanges();
  });

  it('loads patients for an operation', () => {
    expect(component).toBeTruthy();
    expect(component.patientsFiltered?.length).toBe(1);
  });
});
