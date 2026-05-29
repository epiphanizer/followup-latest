import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientIntakeQuestionService } from '../../patient-intake-question/patient-intake-question.service';
import {
  PatientIntakeQuestion,
  PatientIntakeQuestionAnswer
} from '../../patient-intake-question/patient-intake-question.component';

@Component({
  selector: 'app-patient-notes',
  templateUrl: './patient-notes.component.html',
  styleUrls: ['./patient-notes.component.scss'],
  standalone: false
})
export class PatientNotesComponent implements OnInit {
  @Input() patient: Patient;
  patientIntakeQuestions: PatientIntakeQuestion[];
  patientMedicalConditions: any = null;
  constructor(private patientIntakeQuestionService: PatientIntakeQuestionService) {}

  ngOnInit() {
    this.patientIntakeQuestionService
      .getPatientIntakeQuestionsByPatientId(this.patient.patientId)
      .subscribe((patientIntakeQuestions: PatientIntakeQuestion[]) => {
        this.patientIntakeQuestions = patientIntakeQuestions;
        this.patientIntakeQuestions.forEach((patientIntakeQuestions: PatientIntakeQuestion, index: number) => {
          this.patientIntakeQuestionService
            .getPatientIntakeQuestionAnswersByPatientIntakeQuestionId(patientIntakeQuestions.patientIntakeQuestionId)
            .subscribe((patientIntakeQuestionAnswer: PatientIntakeQuestionAnswer | PatientIntakeQuestionAnswer[]) => {
              const answerRecord = Array.isArray(patientIntakeQuestionAnswer)
                ? patientIntakeQuestionAnswer[0]
                : patientIntakeQuestionAnswer;
              if (answerRecord) {
                this.patientIntakeQuestions[
                  index
                ].patientIntakeQuestionAnswer = answerRecord.patientIntakeQuestionAnswer as any;
              }
            });
        });
      });
    var self = this;
    this.patientMedicalConditions = new Array();
    function getKeyByValue(object: Record<string, any>, value: number) {
      for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
          if (object[prop] === value || object[prop] === true) {
            self.patientMedicalConditions.push(prop);
          }
        }
      }
    }
    let medicalConditionsJson = JSON.parse(this.patient.patientMedicalConditions);
    getKeyByValue(medicalConditionsJson, 1);
  }
}
