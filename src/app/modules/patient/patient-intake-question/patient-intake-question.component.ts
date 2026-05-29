import { Component, OnInit } from '@angular/core';

export interface PatientIntakeQuestion {
  patientIntakeQuestionId: string;
  patientIntakeQuestion: string;
  patientQuestionType: string;
  patientIntakeQuestionOrder: number;
  patientIntakeQuestionAnswer?: PatientIntakeQuestionAnswer;
}

export interface PatientIntakeQuestionAnswer {
  patientIntakeQuestionAnswerId: string;
  patientIntakeQuestionAnswer: string;
}

@Component({
  template: '',
  standalone: false
})
export class PatientIntakeQuestionComponent implements OnInit {
  ngOnInit() {}
}
