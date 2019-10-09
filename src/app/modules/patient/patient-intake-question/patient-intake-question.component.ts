import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface PatientIntakeQuestion {
  patientIntakeQuestionId: number;
  patientIntakeQuestion: string;
  patientQuestionType: string;
  patientIntakeQuestionOrder: number;
}

export interface PatientIntakeQuestionAnswer {
  patientIntakeQuestionAnswerId: number;
  patientIntakeQuestionAnswer: string;
}

export class PatientIntakeQuestionComponent implements OnInit {
  ngOnInit() {}
}
