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
          return patients;
        })
      );
    }
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
      this.patients.sort((a: Patient, b: Patient) => a.patientLastName.localeCompare(b.patientLastName));
    } else {
      this.patients.sort((a: Patient, b: Patient) => b.patientLastName.localeCompare(a.patientLastName));
    }
  };
  sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'discharge-date';
    if (sortFlag == 'asc') {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(a.patientDischargeDate) - <any>new Date(b.patientDischargeDate);
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>new Date(b.patientDischargeDate) - <any>new Date(a.patientDischargeDate);
      });
    }
  };
  sortPatientsByPatientStatus = function(sortFlag: string) {
    this.filterBy = 'patient-status';
    if (sortFlag == 'asc') {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>a.patientStatusLabel.localeCompare(b.patientStatusLabel);
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>b.patientStatusLabel.localeCompare(a.patientStatusLabel);
      });
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
}
