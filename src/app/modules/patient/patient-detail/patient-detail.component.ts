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
import { PatientCallStatus, PatientCallStatusService } from './patient-call/patient-call-status.service';
import { formatDate } from '@angular/common';
import { share, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  providers: [PatientCallService, PatientCallNotesService, PatientCallStatusService, PatientCallQuestionsService],
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
  patientCallNotesHighlighted: number = 0;
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestionAnswers: PatientCallQuestionAnswer[];
  patientCallStatuses: PatientCallStatus[];

  patientNextCall: {
    date: string;
    patientCallStatusLabelId: number;
  };
  patientNextCallQuestions: PatientCallQuestion[];

  constructor(
    private patientCallService: PatientCallService,
    private patientCallNotesService: PatientCallNotesService,
    private patientCallStatusService: PatientCallNotesService,
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
    });

    this.patientNextCall = {
      date: '',
      patientCallStatusLabelId: 1
    };
    this.patientNextCallQuestions = [];
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
    }, 50);
  }

  patientCallStatusLabelChangeHandler($event: number) {
    let patientCallStatusLabelId = $event;
    this.patientCall.patientCallStatusLabelId = patientCallStatusLabelId;
    this.patientCall.patientCallStatusLabel = 'User Selected Status';
  }
  patientNextCallDateSelectedEventHandler($event: string) {
    let selectedDate = $event;
    let newDate = formatDate(selectedDate, 'MM-dd-yyyy', 'en-US');
    this.patientNextCall.date = newDate;
  }
  patientCallNotesChangeHandler($event: PatientCallNotes) {
    this.patientCallNotes = $event;
  }
  patientCallNotesHighlightedChangeHandler($event: number) {
    this.patientCallNotesHighlighted = $event;
  }

  patientCallQuestionsChangeHandler($event: PatientCallQuestionAnswer[]) {
    this.patientCallQuestionAnswers = $event;
  }
  patientNextCallQuestionsChangeHandler($event: PatientCallQuestion[]) {
    this.patientNextCallQuestions = $event;
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
      .addPatientCallNotesByPatientCallId(
        this.patientCall.patientCallId,
        this.patientCallNotes.patientCallNotes,
        this.patientCallNotesHighlighted
      )
      .subscribe((data: any) => {
        // Better check since this currently returns nothin good
        console.log('added patient call notes successfully');
      });

    if (!this.patientCallQuestionAnswers) {
      alert('Please select an answer to at least one question');
      let element = document.querySelector('#patientCallNotesForm');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (!this.patientNextCall.date) {
      alert('Please schedule a call date');
      let element = document.querySelector('#next-call-calendar');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    this.patientCallService.finalizePatientCall(this.patientCall).subscribe((data: any) => {
      console.log(data);
      console.log('finalized call');
      debugger;
      // Update the call status
      // Talk to our service to answer the existing call questions
      this.patientCallQuestionAnswers.forEach((patientCallQuestionAnswer: PatientCallQuestionAnswer) => {
        let patientCallQuestionId = parseInt(Object.keys(patientCallQuestionAnswer).toString());
        let patientCallQuestionAnswerText = patientCallQuestionAnswer[patientCallQuestionId];
        if (patientCallQuestionAnswerText !== undefined) {
          this.patientCallQuestionsService
            .addPatientCallQuestionAnswersByPatientCallQuestionId(patientCallQuestionId, patientCallQuestionAnswerText)
            .subscribe();
        }
      });

      var isoString = new Date(this.patientNextCall.date).toISOString();
      /**
       * Passing E2E as of now
       */
      this.patientCallService
        .addNewPatientCallByPatientId(
          this.patient.patientId,
          isoString,
          // (3 => 'scheduled' status)
          3
        )
        .subscribe((data: any) => {
          let patientCallId = data.patientCallId;
          let itemsProcessed = 0;
          this.patientNextCallQuestions.forEach((patientCallQuestion: PatientCallQuestion) => {
            this.patientCallQuestionsService
              .addPatientCallQuestionByPatientCallId(patientCallId, patientCallQuestion)
              .subscribe((data: any) => {
                itemsProcessed++;
                if (itemsProcessed === this.patientNextCallQuestions.length) {
                  this.patientCall.patientCallId = patientCallId;
                  location.reload();
                }
              });
          });
        });
    });
  }
}
