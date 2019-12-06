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
          this.patients = patients;
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
  }
  sortPatientsByPatientName = function(sortFlag: string) {
    this.filterBy = 'patient-name';
    if (this.selectedSortFlag == 'desc') {
      this.patients.sort();
    } else {
      this.patients.reverse();
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
        return <any>a.patientCurrentStatusLabel - <any>b.patientCurrentStatusLabel;
      });
    } else {
      this.patients.sort((a: Patient, b: Patient) => {
        return <any>a.patientCurrentStatusLabel - <any>b.patientCurrentStatusLabel;
      });
    }
  };
}
