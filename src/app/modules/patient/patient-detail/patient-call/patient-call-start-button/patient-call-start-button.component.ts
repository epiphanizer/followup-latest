import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PatientCall, PatientCallService } from '../patient-call.service';
import { Observable } from 'rxjs';
import { Patient } from '@app/modules/patient/patient.service';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-call-start-button',
  templateUrl: './patient-call-start-button.component.html',
  styleUrls: ['./patient-call-start-button.component.scss']
})
export class PatientCallStartButtonComponent implements OnInit {
  patientCall$: Observable<PatientCall>;
  @Input() patient: Patient;
  @Output() patientCallStartEventEmitter = new EventEmitter<PatientCall>();
  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {}
  public patientCallStartEvent(patientId: number) {
    this.patientCall$ = this.patientCallService
      .addPatientCallByPatientId(patientId)
      .subscribe((patientCall: PatientCall) => {
        // Send the patient call out into the ecosystem
        console.log(patientCall);
        debugger;
        this.patientCallStartEventEmitter.emit(patientCall);
      });
  }
}
