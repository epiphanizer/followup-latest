import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientQuestion } from './patient-question.service';

export interface PatientQuestion {
  patientQuestionId: number;
  patientQuestion: string;
  patientQuestionType: string;
  patientQuestionHighlight: boolean;
}

@Component({
  selector: 'app-patient-question',
  templateUrl: './patient-question.component.html',
  styleUrls: ['./patient-question.component.scss']
})
export class PatientQuestionComponent implements OnInit {
  @Input() patientQuestion: PatientQuestion;

  ngOnInit() {
    console.log(this.patientQuestion);
  }
}
