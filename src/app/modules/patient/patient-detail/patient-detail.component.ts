import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import {
  PatientCall,
  PatientCallService,
  PatientCallQuestion,
  PatientCallQuestionAnswer
} from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { Operation } from '@app/modules/operation/operation.service';
import { IonTextarea } from '@ionic/angular';
import {
  PatientCallNotesService,
  PatientCallNotes
} from './patient-call/patient-call-notes/patient-call-notes.service';
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
  patientCallNotes: PatientCallNotes;
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestionAnswers: PatientCallQuestionAnswer[];
  constructor(
    private patientCallService: PatientCallService,
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
  patientCallNotesChangeHandler($event: PatientCallNotes) {
    alert('changed call notes');
    this.patientCallNotes = $event;
    console.log(this.patientCallNotes);
  }
  patientCallStatusLabelChangeHandler($event: number) {
    let patientCallStatusLabelId = $event;
    this.patientCall.patientCallStatusLabelId = patientCallStatusLabelId;
  }
  patientCallFinishEventHandler($event: PatientCall) {
    this.patientCall = $event;
    /**
     * We are in review mode, back out
     */
    if (this.patientCall.patientCallStatusLabel == 'In Review') {
      alert('getting to our patient call finish event handler');
      return;
    }
    /**
     * Add the patient question data
     */
    this.patientCallNotesService
      .addPatientCallNotesByPatientCallId(this.patientCall.patientCallId, this.patientCallNotes)
      .subscribe((data: any) => {
        console.log(data);
        debugger;
      });

    // add answers to our questions to the current call
    // this will require processing
    // debugger;
    // this.patientCallQuestionsService.addNewPatientCallQuestionAnswersByPatientCallQuestionId(
    //   this.patientCall.patientCallQuestionId
    // ).subscribe((data: any) => {
    //   console.log(data);
    //
    // });

    this.patientCallService.finalizePatientCall(this.patientCall).subscribe((data: any) => {
      console.log(data);
      debugger;
      alert('finalized existing call successfully');

      this.patientCallService.addNewPatientCallByPatientId(this.patient.patientId, 2).subscribe((data: any) => {
        alert('scheduled upcoming call successfully');
        console.log(data);
        debugger;
        let patientCallId = data.patientCallId;
        this.patientCallService
          .getPatientCallByPatientCallId(this.patient.patientId, patientCallId)
          .subscribe((data: any) => {
            console.log(data);
            alert('found and loaded upcoming call successfully');
            debugger;
            this.patientCall = data[0];
          });
      });
    });
  }
}
