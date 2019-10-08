import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface PatientIntakeQuestion {
  patientIntakeQuestionId: number;
  patientIntakeQuestion: string;
  patientQuestionType: string;
  patientIntakeQuestionOrder: number;
}

export class PatientIntakeQuestionComponent implements OnInit {
  //   @Input() patientIntakeQuestion: PatientIntakeQuestion;

  ngOnInit() {
    // console.log(this.patientQuestion);
  }
}
