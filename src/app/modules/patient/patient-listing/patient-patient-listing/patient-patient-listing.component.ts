import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';

@Component({
  selector: 'app-patient-patient-listing',
  templateUrl: './patient-patient-listing.component.html',
  styleUrls: ['./patient-patient-listing.component.scss']
})
export class PatientPatientListingComponent implements OnInit {
  @Input() mode: any;
  @Input() operation: Operation;
  public pageSelected: number = 0;
  public pageLength: number = 20;
  public pageOfItems: Patient[];
  public patients: Patient[];
  public sorted: boolean = false;
  // public patients$: Observable<Patient[]>;
  public patientsFiltered: Patient[];
  public selectedSortFlag: string = 'desc';
  public colDefs = ['Date', 'Patient', 'Sex', 'Patient #', 'Status', 'Completed'];
  public selectedSortOption: string = this.colDefs[0];
  constructor(private patientService: PatientService) {}
  ngOnInit() {
    if (this.mode.spanish) {
      this.patientService.getActiveSpanishPatients().pipe(
        take(1),
        map((patients: Patient[]) => {
          if (patients) {
            this.patients = patients;
            this.patientsFiltered = patients;
            this.runSortSwitch();
          } else {
            this.patientsFiltered = this.patients = [];
          }
          return patients;
        })
      );
    } else {
      this.patientService
        .getPatientsByOperationId(this.operation.operationId)
        .pipe(
          take(1),
          map((patients: Patient[]) => {
            if (patients) {
              this.patients = patients;
              this.patientsFiltered = patients;
              this.runSortSwitch();
            } else {
              this.patientsFiltered = this.patients = [];
            }
            return patients;
          })
        )
        .subscribe();
    }
  }

  ngOnChanges(changes: any) {
    console.log(changes);
    if (changes.operation && !this.mode.spanish) {
      this.patients = [];
      this.operation = changes.operation.currentValue;
      this.patientService
        .getPatientsByOperationId(this.operation.operationId)
        .pipe(
          map((patients: Patient[]) => {
            if (patients) {
              this.pageSelected = 0;
              this.sorted = false;
              this.patients = patients;
              this.patientsFiltered = patients;
              this.runSortSwitch();
              // this.onChangePage(patients);
            } else {
              this.pageSelected = 0;
              this.sorted = false;
              this.patientsFiltered = this.patients = [];
              this.runSortSwitch();
              // this.onChangePage(this.patients);
            }
            return this.patients;
          })
        )
        .subscribe();
    }
  }
  getPatientLink(patient: Patient) {
    if (patient.patientStatusLabel != 'In Progress' || !patient.patientActive) {
      return '/call-queue/operations/' + patient.patientOperationId + '/patient/' + patient.patientId + '/history';
    }
    return '/call-queue/operations/' + patient.patientOperationId + '/patient/' + patient.patientId;
  }

  sortOptionSelected($event: string) {
    this.selectedSortOption = $event;
    this.runSortSwitch();
  }
  // We get passsed asc or desc back from event emitter
  toggleAscDesc($event: string) {
    this.selectedSortFlag = $event;
    this.runSortSwitch();
  }

  runSortSwitch() {
    switch (this.selectedSortOption) {
      case 'Date':
        this.sortPatientsByDischargeDate();
        break;
      case 'Patient':
        this.sortPatientsByPatientName();
        break;
      case 'Sex':
        this.sortPatientsByPatientGender();
        break;
      case 'Patient #':
        this.sortPatientsByPatientRecordNumber();
        break;
      case 'Status':
        this.sortPatientsByPatientStatus();
        break;
      case 'Completed':
        this.sortPatientsByCompletedStatus();
        break;
    }
    this.sorted = true;
  }
  sortPatientsByPatientName = function() {
    if (this.selectedSortFlag == 'desc') {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>a.patientLastName.localeCompare(b.patientLastName);
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>b.patientLastName.localeCompare(a.patientLastName);
        })
        .slice();
    }
  };
  sortPatientsByPatientRecordNumber = function() {
    if (this.selectedSortFlag == 'desc') {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>a.patientMedicalRecordNumber.localeCompare(b.patientMedicalRecordNumber);
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>b.patientMedicalRecordNumber.localeCompare(a.patientMedicalRecordNumber);
        })
        .slice();
    }
  };
  sortPatientsByDischargeDate = function() {
    if (this.selectedSortFlag == 'asc') {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(a.patientDischargeDate) - <any>new Date(b.patientDischargeDate);
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>new Date(b.patientDischargeDate) - <any>new Date(a.patientDischargeDate);
        })
        .slice();
    }
  };
  sortPatientsByPatientGender = function() {
    if (this.selectedSortFlag == 'asc') {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>a.patientGender.localeCompare(b.patientGender);
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>b.patientGender.localeCompare(a.patientGender);
        })
        .slice();
    }
  };

  sortPatientsByPatientStatus = function() {
    if (this.selectedSortFlag == 'asc') {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>a.patientStatusLabel.localeCompare(b.patientStatusLabel);
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>b.patientStatusLabel.localeCompare(a.patientStatusLabel);
        })
        .slice();
    }
  };

  sortPatientsByCompletedStatus = function() {
    if (this.selectedSortFlag == 'asc') {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>a.patientGraduated - <any>b.patientGraduated;
        })
        .slice();
    } else {
      this.patientsFiltered = this.patients
        .sort((a: Patient, b: Patient) => {
          return <any>b.patientGraduated - <any>a.patientGraduated;
        })
        .slice();
    }
  };
  searchFilterEventEmitted($event: KeyboardEvent) {
    this.searchPatients($event);
  }
  searchPatients($event: KeyboardEvent): Patient[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.patientsFiltered = this.patients
      .filter((patient: Patient) => {
        let patientFullName = patient.patientFirstName + ' ' + patient.patientLastName;
        return patientFullName.toLowerCase().includes(searchText);
      })
      .slice();
    this.pageOfItems = this.patientsFiltered;
    return this.patientsFiltered;
  }
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageSelected++;
    this.pageOfItems = pageOfItems;
  }
}
