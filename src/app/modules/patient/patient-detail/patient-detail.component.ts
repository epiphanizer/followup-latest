import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCall, PatientCallService } from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { Operation } from '@app/modules/operation/operation.service';
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
  patientCall: PatientCall;
  constructor(private patientCallService: PatientCallService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.patientCallService
      .getPatientCallByPatientCallId(this.patient.patientId, this.patient.nextPatientCallId)
      .subscribe((patientCall: PatientCall) => {
        this.patientCall = patientCall[0];
      });
  }

  patientCallStartEventHandler() {
    this.patientCallService.startPatientCall(this.patientCall.patientCallId);
    this.patientCall.patientCallStatusLabelId = 3;
    this.patientCall.patientCallStatusLabel = 'Started';
  }

  patientCallEndEventHandler($event: PatientCall) {
    this.patientCall = $event;
    this.patientCallService.endPatientCall(this.patientCall.patientCallStatusLabelId);
    this.patientCall.patientCallStatusLabelId = 4;
    this.patientCall.patientCallStatusLabel = 'In Review';
  }
  finishPatientCall($event: PatientCall) {
    this.patientCall = $event;
    this.patientCallService.finalizePatientCall(this.patientCall.patientCallStatusLabelId);
    debugger;
  }
}
