import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'protractor';
import { PatientCall, PatientCallService } from '../patient-call.service';
import { Observable } from 'rxjs';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-call-start-button',
  templateUrl: './patient-call-start-button.component.html',
  styleUrls: ['./patient-call-start-button.component.scss']
})
export class PatientCallStartButtonComponent implements OnInit {
  patientCall$: Observable<PatientCall>;

  @Output() patientCallStartEventEmitter = new EventEmitter<number>();
  constructor(private patientCallService: PatientCallService) {
    thi;
  }

  ngOnInit() {}
  startPatientCall() {
    alert('Starting Patient Call');
  }
  public patientCallStartEvent(patientId: number) {
    this.patientCall$ = this.patientCallService
      .addPatientCallByPatientId(patientId)
      .subscribe((patientCall: PatientCall) => {
        alert('emitting patient call');
        debugger;
        this.patientCallStartEventEmitter.emit(patientCall);
      });
  }
}
