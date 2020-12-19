import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { DatePipe } from '@angular/common';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  providers: [AuthenticationService, DatePipe, OperationService, PatientService, UserService],
  selector: 'app-patient-listing-filter',
  templateUrl: './patient-listing-filter.component.html',
  styleUrls: ['./patient-listing-filter.component.scss']
})
export class PatientListingFilterComponent implements OnInit {
  @Input() operation: Operation;
  @Input() filterDate: string;
  patients: Patient[];
  patientsFiltered: Patient[] = [];
  user: User;
  todaysDate: string;

  constructor(
    private operationService: OperationService,
    private patientService: PatientService,
    private datePipe: DatePipe
  ) {}
  ngOnInit() {
    this.patientService.getPatientsByOperationId(this.operation.operationId).subscribe((patients: Patient[]) => {
      if (!patients) {
        this.patients = [];
      }
      this.patients = patients;
      this.searchPatientsBySelectedDate(this.filterDate);
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.patients) {
      if (changes.filterDate) {
        this.filterDate = changes.filterDate.currentValue;
        this.searchPatientsBySelectedDate(this.filterDate);
      }
    }
    if (this.operation) {
      if (changes.operation) {
        this.patientService.getPatientsByOperationId(this.operation.operationId).subscribe((patients: Patient[]) => {
          if (!patients) {
            this.patients = [];
          }
          this.patients = patients;
          this.searchPatientsBySelectedDate(this.filterDate);
        });
      }
    }
  }

  searchPatientsBySelectedDate(selectedDate: string): Patient[] {
    let selectedDateObj = new Date(selectedDate);
    let transformedDate = this.datePipe.transform(selectedDateObj, 'yyyy-MM-dd');
    if (this.patients) {
      this.patientsFiltered = this.patients.filter((patient: Patient) => {
        if (patient.patientAdmitDate) {
          return patient.patientAdmitDate.toString().indexOf(transformedDate) !== -1;
        } else {
          return patient.patientAdmitDate.toString().indexOf(transformedDate) !== -1;
        }
      });
    }
    return this.patientsFiltered;
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
