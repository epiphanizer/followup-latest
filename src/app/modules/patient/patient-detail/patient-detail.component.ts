import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import {
  PatientCall,
  PatientCallService,
  PatientCallStatusLabel,
  PatientCallQuestion,
  PatientCallQuestionAnswer
} from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { Operation } from '@app/modules/operation/operation.service';
import { IonTextarea } from '@ionic/angular';
import { PatientCallNotesService } from './patient-call/patient-call-notes/patient-call-notes.service';
import { PatientCallStatusService } from './patient-call/patient-call-status.service';
import { PatientCallQuestionsService } from './patient-call/patient-call-questions/patient-call-questions.service';

@Component({
  providers: [PatientCallService, PatientCallNotesService, PatientCallQuestionsService],
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
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestionAnswers: PatientCallQuestionAnswer[];
  constructor(
    private patientCallService: PatientCallService,
    private patientCallStatusService: PatientCallStatusService,
    private patientCallNotesService: PatientCallNotesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.patientCallService
      .getPatientCallByPatientCallId(this.patient.patientId, this.patient.nextPatientCallId)
      .subscribe((patientCall: PatientCall) => {
        this.patientCall = patientCall[0];
      });
  }

  patientCallStartEventHandler(userId: number) {
    this.patientCallService
      .startPatientCallByUserIdAndPatientCallId(userId, this.patientCall.patientCallId)
      .subscribe((data: any) => {
        console.log(data);
        this.patientCall.patientCallStatusLabelId = 3;
        this.patientCall.patientCallStatusLabel = 'Started';
      });
  }

  patientCallEndEventHandler($event: PatientCall) {
    this.patientCall = $event;
    this.patientCallService.endPatientCall(this.patientCall.patientCallId);
    this.patientCall.patientCallStatusLabelId = 4;
    this.patientCall.patientCallStatusLabel = 'In Review';
  }
  patientCallStatusLabelChangeHandler($event: PatientCall) {
    let patientCall = $event;
    this.patientCallStatusService.addPatientCallStatusByPatientCallId(
      patientCall.patientCallId,
      patientCall.patientCallStatusLabelId
    );
    this.patientCall.patientCallStatusLabelId = 4;
    this.patientCall.patientCallStatusLabel = 'In Review';
  }
  finishPatientCall($event: PatientCall) {
    this.patientCall = $event;
    this.patientCallNotesService
      .addPatientCallNotesByPatientCallId(this.patientCall.patientCallId)
      .subscribe((data: any) => {
        console.log(data);
        debugger;
      });
    // add the highlights to the notes

    // schedule the next call
    this.patientCallService
      .addNewPatientCallByPatientId(this.patient.patientId, this.patientCall.patientCallStatusLabelId)
      .subscribe((data: any) => {
        console.log(data);
        // add custom questions to the next call
      });

    // this will require processing
    debugger;
    // this.patientCallQuestionsService.addNewPatientCallQuestionAnswersByPatientCallQuestionId(
    //   this.patientCall.patientcallQuestionId
    // ).subscribe((data: any) => {
    //   console.log(data);
    //   // add custom questions to the next call
    // });

    this.patientCallService.finalizePatientCall(this.patientCall).subscribe((data: any) => {
      console.log(data);
      debugger;
    });
  }
}
