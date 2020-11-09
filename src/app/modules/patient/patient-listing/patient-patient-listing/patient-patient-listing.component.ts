import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(private patientService: PatientService) {}
  ngOnInit() {
    this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
      map((patients: Patient[]) => {
        this.patients = patients;
        this.patientsFiltered = patients;
        this.sortPatientsByDischargeDate(this.selectedSortFlag);
        return patients;
      })
    );
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.patients = [];
      this.operation = changes.operation.currentValue;
      this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
        map((patients: Patient[]) => {
          this.patientsFiltered = patients;
          this.sortPatientsByDischargeDate(this.selectedSortFlag);
          return patients;
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
  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
    if (this.filterBy == 'patient-name') {
      this.sortPatientsByPatientName(this.selectedSortFlag);
    } else if (this.filterBy == 'discharge-date') {
      this.sortPatientsByDischargeDate(this.selectedSortFlag);
    } else if (this.filterBy == 'patient-status') {
      this.sortPatientsByPatientStatus(this.selectedSortFlag);
    }
  }
  sortPatientsByPatientName = function(sortFlag: string) {
    this.filterBy = 'patient-name';
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

  searchPatients($event: KeyboardEvent): Patient[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.patientsFiltered = this.patients.filter((patient: Patient) => {
      let patientFullName = patient.patientFirstName + ' ' + patient.patientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.patientsFiltered;
  }
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }
}
