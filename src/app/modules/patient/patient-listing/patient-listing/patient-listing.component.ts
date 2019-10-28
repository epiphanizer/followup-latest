import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PatientService } from '../../patient.service';
import { Patient } from '../../patient';

@Component({
  selector: 'app-patient-listing',
  templateUrl: './patient-listing.component.html',
  styleUrls: ['./patient-listing.component.scss']
})
export class PatientListingComponent implements OnInit {
  @Input() operation: Operation;
  public patients: Patient[];
  public patients$: Observable<Patient[]>;
  public filterBy: string = 'notification-date';
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

  sortPatientsByDischargeDate = function(sortFlag: string) {
    this.filterBy = 'patient';
  };
  sortPatientsByCallDate = function(sortFlag: string) {
    this.filterBy = 'status';
    alert('Toggling patients by status');
  };
}
