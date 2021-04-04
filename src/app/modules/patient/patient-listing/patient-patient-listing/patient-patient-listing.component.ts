import { Component, OnInit, Input } from '@angular/core';
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
  @Input() operation: Operation;
  public pageOfItems: Patient[];
  public patients: Patient[];
  public patients$: Observable<Patient[]>;
  public patientsFiltered: Patient[];
  public filterBy: string = 'discharge-date';
  public selectedSortFlag: string = 'desc';
  public colDefs = ['Discharge', 'Patient', 'Sex', 'Status', 'Completed'];
  public selectedSortOption: string = this.colDefs[0];
  constructor(private patientService: PatientService) {}
  ngOnInit() {
    this.patients$ = this.patientService.getPatientsByOperationId(this.operation.operationId).pipe(
      take(1),
      map((patients: Patient[]) => {
        if (patients) {
          this.patients = patients;
          this.patientsFiltered = patients;
          this.sortPatientsByDischargeDate(this.selectedSortFlag);
        } else {
          this.patientsFiltered = this.patients = [];
        }
        return patients;
      })
    );
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.patients = [];
      this.operation = changes.operation.currentValue;
      this.patients$ = this.patientService.getPatientsByOperationId(this.operation.operationId).pipe(
        map((patients: Patient[]) => {
          if (patients) {
            this.patients = patients;
            this.patientsFiltered = patients;
            this.sortPatientsByDischargeDate(this.selectedSortFlag);
          } else {
            this.patientsFiltered = this.patients = [];
          }
          return this.patients;
        })
      );
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
    console.log('in sort switch, sorting by ' + this.selectedSortOption + ' ' + this.selectedSortFlag);
    switch (this.selectedSortOption) {
      case 'Date':
        this.sortPatientsByDischargeDate(this.selectedSortFlag);
        break;
      case 'Patient':
        this.sortPatientsByPatientName(this.selectedSortFlag);
        break;
      case 'Patient #':
        this.sortPatientsByPatientRecordNumber(this.selectedSortFlag);
        break;
      case 'Sex':
        this.sortPatientsByPatientStatus(this.selectedSortFlag);
        break;
      case 'Status':
        this.sortPatientsByPatientStatus(this.selectedSortFlag);
        break;
    }
  }
  sortPatientsByPatientName = function(sortFlag: string) {
    this.filterBy = 'patient-name';
    console.log('sorting by patient name fn.');
    if (sortFlag == 'desc') {
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
  sortPatientsByPatientRecordNumber = function(sortFlag: string) {
    this.filterBy = 'patient-name';
    console.log('sorting by patient name fn.');
    if (sortFlag == 'desc') {
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
  sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'discharge-date';
    if (sortFlag == 'asc') {
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
  sortPatientsByPatientStatus = function(sortFlag: string) {
    this.filterBy = 'patient-status';

    this.patientsFiltered = {};
    if (sortFlag == 'asc') {
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
  searchFilterEventEmitted($event: KeyboardEvent) {
    this.searchPatients($event);
  }
  searchPatients($event: KeyboardEvent): Patient[] {
    console.log($event);
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.patientsFiltered = this.patients
      .filter((patient: Patient) => {
        let patientFullName = patient.patientFirstName + ' ' + patient.patientLastName;
        return patientFullName.toLowerCase().includes(searchText);
      })
      .slice();
    console.log(this.patientsFiltered);
    return this.patientsFiltered;
  }
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }
}
