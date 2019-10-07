import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientCall, PatientCallService } from '../patient-call.service';
import { User } from '@app/modules/user/user';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-call-start-button',
  templateUrl: './patient-call-start-button.component.html',
  styleUrls: ['./patient-call-start-button.component.scss']
})
export class PatientCallStartButtonComponent implements OnInit {
  @Input() user: User;
  @Input() patientCall: PatientCall;
  @Output() patientCallStartEventEmitter = new EventEmitter<number>();
  constructor() {}

  ngOnInit() {}

  public patientCallStartEvent() {
    let userId = this.user.id;
    this.patientCallStartEventEmitter.emit(userId);
  }
}
