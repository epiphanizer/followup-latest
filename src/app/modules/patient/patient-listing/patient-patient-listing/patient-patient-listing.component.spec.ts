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

  it('loads spanish patients when mode.spanish is true', () => {
    patientServiceStub.getActiveSpanishPatients.mockReturnValueOnce(
      of([
        {
          patientId: 'p2',
          patientFirstName: 'Ana',
          patientLastName: 'Ramirez',
          patientDischargeDate: '2020-02-01',
          patientMedicalRecordNumber: '456',
          patientGender: 'F',
          patientStatusLabel: 'In Progress',
          patientGraduated: 1,
          patientOperationId: 'op2'
        }
      ])
    );

    const spanishFixture = TestBed.createComponent(PatientPatientListingComponent);
    const spanishComponent = spanishFixture.componentInstance;
    spanishComponent.mode = { spanish: true } as any;
    spanishComponent.operation = { operationId: 'op2' } as any;
    spanishFixture.detectChanges();

    expect(patientServiceStub.getActiveSpanishPatients).toHaveBeenCalled();
  });

  it('searches and sorts patients', () => {
    component.patients = [
      {
        patientId: 'p1',
        patientFirstName: 'Zane',
        patientLastName: 'Alpha',
        patientDischargeDate: '2020-01-01',
        patientMedicalRecordNumber: '111',
        patientGender: 'M',
        patientStatusLabel: 'In Progress',
        patientGraduated: 0,
        patientOperationId: 'op1'
      } as any,
      {
        patientId: 'p2',
        patientFirstName: 'Amy',
        patientLastName: 'Zeus',
        patientDischargeDate: '2021-01-01',
        patientMedicalRecordNumber: '222',
        patientGender: 'F',
        patientStatusLabel: 'Active',
        patientGraduated: 1,
        patientOperationId: 'op1'
      } as any
    ];
    component.selectedSortOption = 'Patient';
    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientLastName).toBe('Alpha');

    const results = component.searchPatients('amy');
    expect(results.length).toBe(1);
    expect(component.selectedSortFlag).toBe('desc');
  });

  it('sorts by discharge date and toggles direction', () => {
    component.patients = [
      {
        patientLastName: 'One',
        patientDischargeDate: '2021-01-01'
      } as any,
      {
        patientLastName: 'Two',
        patientDischargeDate: '2020-01-01'
      } as any
    ];
    component.selectedSortOption = 'Date';
    component.selectedSortFlag = 'asc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientLastName).toBe('Two');

    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientLastName).toBe('One');
  });

  it('sorts by record, gender, status, and completed fields', () => {
    component.patients = [
      {
        patientLastName: 'A',
        patientMedicalRecordNumber: '222',
        patientGender: 'M',
        patientStatusLabel: 'Zed',
        patientGraduated: 1
      } as any,
      {
        patientLastName: 'B',
        patientMedicalRecordNumber: '111',
        patientGender: 'F',
        patientStatusLabel: 'Able',
        patientGraduated: 0
      } as any
    ];

    component.selectedSortOption = 'Patient #';
    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientMedicalRecordNumber).toBe('111');

    component.selectedSortOption = 'Sex';
    component.selectedSortFlag = 'asc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientGender).toBe('F');

    component.selectedSortOption = 'Status';
    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientStatusLabel).toBe('Zed');

    component.selectedSortOption = 'Completed';
    component.selectedSortFlag = 'asc';
    component.runSortSwitch();
    expect(component.patientsFiltered[0].patientGraduated).toBe(0);
  });

  it('handles page changes and toggle events', () => {
    component.pageSelected = 0;
    component.onChangePage([{ id: 1 } as any]);
    expect(component.pageSelected).toBe(1);
    expect(component.pageOfItems?.length).toBe(1);

    const sortSpy = jest.spyOn(component, 'runSortSwitch');
    component.sortOptionSelected('Patient');
    component.toggleAscDesc('asc');
    expect(sortSpy).toHaveBeenCalledTimes(2);
  });

  it('reloads patients when operation changes', () => {
    component.mode = { spanish: false } as any;
    component.operation = { operationId: 'initial' } as any;
    component.ngOnChanges({ operation: { currentValue: { operationId: 'next' } } as any });
    expect(component.patientsFiltered?.length).toBeGreaterThan(0);
  });

  it('builds patient links based on status', () => {
    const patientActive = {
      patientStatusLabel: 'In Progress',
      patientActive: true,
      patientOperationId: 'op1',
      patientId: 'p1'
    } as any;
    const patientInactive = {
      patientStatusLabel: 'Done',
      patientActive: false,
      patientOperationId: 'op1',
      patientId: 'p1'
    } as any;

    expect(component.getPatientLink(patientActive)).toContain('/call-queue/operations/op1/patient/p1');
    expect(component.getPatientLink(patientInactive)).toContain('/history');
  });
});
