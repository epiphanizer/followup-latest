import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserService } from '@app/modules/user/user.service';
import { AuthenticationService } from '@app/core';
import { Patient, PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation.service';

@Component({
  providers: [AuthenticationService, PatientService, UserService],
  selector: 'app-call-queue-patient-filter[operation]',
  templateUrl: './call-queue-patient-filter.component.html',
  styleUrls: ['./call-queue-patient-filter.component.scss']
})
export class CallQueuePatientFilterComponent implements OnInit {
  @Input() operation: Operation;
  user: User;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  constructor(private patientService: PatientService) {}
  ngOnInit() {}
  public searchPatientCallHistory() {
    console.log('Searching patient call history');
  }
}
