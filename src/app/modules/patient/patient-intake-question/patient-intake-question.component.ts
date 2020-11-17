import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface PatientIntakeQuestion {
  patientIntakeQuestionId: number;
  patientIntakeQuestion: string;
  patientQuestionType: string;
  patientIntakeQuestionOrder: number;
  patientIntakeQuestionAnswer?: PatientIntakeQuestionAnswer;
}

export interface PatientIntakeQuestionAnswer {
  patientIntakeQuestionAnswerId: number;
  patientIntakeQuestionAnswer: string;
}

@Component({
  template: ''
})
export class PatientIntakeQuestionComponent implements OnInit {
  ngOnInit() {}
}
