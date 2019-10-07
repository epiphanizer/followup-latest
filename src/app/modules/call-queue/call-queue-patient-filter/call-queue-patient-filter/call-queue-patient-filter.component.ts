import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation.service';
import { PatientCall, PatientCallService } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [AuthenticationService, PatientService, UserService],
  selector: 'app-call-queue-patient-filter[operation]',
  templateUrl: './call-queue-patient-filter.component.html',
  styleUrls: ['./call-queue-patient-filter.component.scss']
})
export class CallQueuePatientFilterComponent implements OnInit {
  @Input() operation: Operation;
  user: User;
  patientCalls: Array<PatientCall> = [];
  userPatientCalls$: Observable<PatientCall[]>;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  constructor(private patientCallService: PatientCallService, private route: ActivatedRoute) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.userPatientCalls$ = this.patientCallService
      .getCallRepCallsByUserIdAndOperationId(this.user.userId, this.operation.operationId)
      .pipe(
        map((patientCalls: PatientCall[]) => {
          this.patientCalls = patientCalls;
        })
      );
  }
}
