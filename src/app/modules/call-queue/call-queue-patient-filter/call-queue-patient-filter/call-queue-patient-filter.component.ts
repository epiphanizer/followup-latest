import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserService } from '@app/modules/user/user.service';
import { AuthenticationService } from '@app/core';
import { Patient, PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation.service';

@Component({
  providers: [AuthenticationService, PatientService, UserService],
  selector: 'app-call-queue-patient-filter',
  templateUrl: './call-queue-patient-filter.component.html',
  styleUrls: ['./call-queue-patient-filter.component.scss']
})
export class CallQueuePatientFilterComponent implements OnInit {
  @Input() operation: Operation;
  user: User;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  constructor(private authService: AuthenticationService, private patientService: PatientService) {}
  ngOnInit() {
    this.authService.getUser().then((result: any) => {
      this.user = this.authService.user;
    });
    this.patients$ = this.patientService.getPatientListByOperationId(this.operation.operationId).pipe(
      map((patients: Patient[]) => {
        map((patient: Patient) => {
          this.patients.push(patient);
        });
        return patients;
      })
    );
  }
  public searchPatientCallHistory() {
    console.log('Searching patient call history');
  }
}
