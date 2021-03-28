import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  providers: [AuthenticationService, OperationService, PatientService, UserService],
  selector: 'app-patient-listing-filter',
  templateUrl: './patient-listing-filter.component.html',
  styleUrls: ['./patient-listing-filter.component.scss']
})
export class PatientListingFilterComponent implements OnInit {
  @Input() operation: Operation;
  patients: Patient[];
  patientsFiltered: Patient[] = [];
  user: User;
  todaysDate: string;

  constructor(private operationService: OperationService, private patientService: PatientService) {}
  ngOnInit() {
    this.patientService.getPatientsByOperationId(this.operation.operationId).subscribe((patients: Patient[]) => {
      if (!patients) {
        this.patients = [];
      }
      this.patients = patients;
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.operation) {
      if (changes.operation) {
        this.patientService.getPatientsByOperationId(this.operation.operationId).subscribe((patients: Patient[]) => {
          if (!patients) {
            this.patients = [];
          }
          this.patients = patients;
          // this.searchPatientsByText();
        });
      }
    }
  }

  searchPatientsByText($event: KeyboardEvent): Patient[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.patientsFiltered = this.patients.filter((patient: Patient) => {
      let patientFullName = patient.patientFirstName + ' ' + patient.patientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.patientsFiltered;
  }
}
