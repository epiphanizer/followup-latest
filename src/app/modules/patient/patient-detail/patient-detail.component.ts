import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import {
  PatientCall,
  PatientCallService,
  PatientCallQuestionAnswer
} from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { Operation } from '@app/modules/operation/operation';
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
import { share, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  providers: [PatientCallService, PatientCallNotesService, PatientCallQuestionsService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  user: User;
  patient: Patient;
  operation: Operation;
  patientCall: PatientCall;
  patientCall$: Observable<PatientCall>;
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
    private patientCallQuestionsService: PatientCallQuestionsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.patientCall$ = this.patientCallService
      .getPatientCallByPatientCallId(this.patient.patientId, this.patient.nextPatientCallId)
      .pipe(
        take(1),
        map((patientCall: PatientCall) => {
          this.patientCall = patientCall[0];
          return this.patientCall;
        })
      );

    this.patient.patientCalls$.subscribe((patientCalls: PatientCall[]) => {
      this.patient.patientCalls = patientCalls;
      debugger;
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

    /**
     * Manipulate existing patientCall answers in patient call history listing
     */
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
    debugger;
    let callQuestionAnswers = [{ patientCallQuestionId: 1, patientCallQuestionAnswer: 'Test Answer' }];
    callQuestionAnswers.forEach((patientCallQuestionAnswer: PatientCallQuestionAnswer) => {
      this.patientCallQuestionsService
        .addPatientCallQuestionAnswersByPatientCallQuestionId(
          patientCallQuestionAnswer.patientCallQuestionId,
          patientCallQuestionAnswer.patientCallQuestionAnswer
        )
        .subscribe((data: any) => {
          console.log(data);
        })
        .unsubscribe();
    });

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
      /**
       * Passing E2E as of now
       */
      this.patientCallService
        .addNewPatientCallByPatientId(
          this.patient.patientId,
          isoString,
          // schedule default (3 == 'scheduled' status)
          3
        )
        .subscribe((data: any) => {
          let patientCallId = data.patientCallId;
          /**
           * Passing E2E as of now
           */
          this.patientCallService
            .getPatientCallByPatientCallId(this.patient.patientId, patientCallId)
            .subscribe((data: any) => {
              this.patientCall = data[0];
              location.reload();
            })
            .unsubscribe();
        })
        .unsubscribe();
    });
  }
}
