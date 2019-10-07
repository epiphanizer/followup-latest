import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import {
  PatientCall,
  PatientCallService,
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
import {
  PatientCallQuestionsService,
  PatientCallQuestion
} from './patient-call/patient-call-questions/patient-call-questions.service';
import { PatientCallStatus } from './patient-call/patient-call-status.service';
import { formatDate } from '@angular/common';

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
  patientCallStatuses: PatientCallStatus[];

  patientNextCall: {
    date: string;
    patientCallStatusLabelId: number;
  };

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
    this.patientNextCall = {
      date: '',
      patientCallStatusLabelId: 1
    };
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
    setTimeout(function() {
      let element = document.querySelector('#patientCallStatusControls');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  }
  patientNextCallDateSelectedEventHandler($event: string) {
    let selectedDate = $event;
    let newDate = formatDate(selectedDate, 'MM-dd-yyyy', 'en-US');
    this.patientNextCall.date = newDate;
  }
  patientCallNotesChangeHandler($event: PatientCallNotes) {
    this.patientCallNotes = $event;
  }
  patientCallStatusLabelChangeHandler($event: number) {
    let patientCallStatusLabelId = $event;
    this.patientCall.patientCallStatusLabelId = patientCallStatusLabelId;
    this.patientCall.patientCallStatusLabel = 'Selected Status';
  }
  patientCallFinishEventHandler($event: PatientCall) {
    this.patientCall = $event;

    if (this.patientCall.patientCallStatusLabel == 'In Review') {
      alert('Please select a call status');
      let element = document.querySelector('#patientCallStatusControls');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (!this.patientCallNotes) {
      alert('Please add patient call notes');
      let element = document.querySelector('#patientCallNotesForm');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    /**
     * Passing E2E
     */
    this.patientCallNotesService
      .addPatientCallNotesByPatientCallId(this.patientCall.patientCallId, this.patientCallNotes)
      .subscribe((data: any) => {
        console.log('added patient call notes successfully');
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

    if (!this.patientNextCall.date) {
      alert('Please schedule a call date');
      let element = document.querySelector('#next-call-calendar');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    this.patientCallService.finalizePatientCall(this.patientCall).subscribe((data: any) => {
      var isoString = new Date(this.patientNextCall.date).toISOString();
      this.patientCallService
        .addNewPatientCallByPatientId(
          this.patient.patientId,
          isoString,
          // default is scheduled
          3
        )
        .subscribe((data: any) => {
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
