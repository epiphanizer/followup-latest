import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '@app/modules/patient/patient';
import { PatientCall, PatientCallService } from '../patient-call.service';
import { User } from '@app/modules/user/user.service';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-call-start-button',
  templateUrl: './patient-call-start-button.component.html',
  styleUrls: ['./patient-call-start-button.component.scss']
})
export class PatientCallStartButtonComponent implements OnInit {
  patientCall$: Observable<PatientCall>;
  @Input() user: User;
  @Input() patient: Patient;
  @Input() patientContactNumberId: number;
  @Output() patientCallStartEventEmitter = new EventEmitter<PatientCall>();
  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}

  public patientCallStartEvent() {
    debugger;
    this.patientCall$ = this.patientCallService
      .startPatientCallByUserIdAndPatientCallId(
        this.user.id,
        this.patient.nextPatientCallId,
        this.patientContactNumberId
      )
      .subscribe((patientCall: PatientCall) => {
        this.patientCallStartEventEmitter.emit(patientCall);
      });
  }
}
