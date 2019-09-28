import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCall, PatientCallService } from '../patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { Operation, OperationService } from '@app/modules/operation/operation.service';
import { IonTextarea } from '@ionic/angular';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  @ViewChild('ion-textarea') patientNotesInput: IonTextarea;
  user: User;
  patient: Patient;
  operation: Operation;
  patientCall: PatientCall | null = null;
  patientCall$: Observable<PatientCall>;
  constructor(private patientCallService: PatientCallService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.patientCallService
      .getPatientCallsByPatientCallId(this.patient.patientId, this.patient.nextPatientCallId)
      .subscribe((patientCall: PatientCall) => {
        this.patientCall = patientCall;
      });
  }

  patientCallStartEventHandler($event: PatientCall) {
    this.patientCallService.startPatientCall(this.patientCall.patientCallId);
  }

  patientCallEndEventHandler($event: PatientCall) {
    this.patientCall = $event;
    this.patientCallService.endPatientCall(this.patientCall.patientCallStatusLabelId);
  }
  patientCallFinishEventHandler($event: PatientCall) {
    this.patientCall = $event;
    this.patientCallService.finalizePatientCall(
      this.patientCall.patientCallId,
      this.patientCall.patientCallStatusLabelId
    );
  }
}
