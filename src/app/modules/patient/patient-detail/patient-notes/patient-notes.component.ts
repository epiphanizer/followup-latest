import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientIntakeQuestionService } from '../../patient-intake-question/patient-intake-question.service';
import { PatientIntakeQuestion } from '../../patient-intake-question/patient-intake-question.component';

@Component({
  selector: 'app-patient-notes',
  templateUrl: './patient-notes.component.html',
  styleUrls: ['./patient-notes.component.scss']
})
export class PatientNotesComponent implements OnInit {
  @Input() patient: Patient;
  patientIntakeQuestions: PatientIntakeQuestion[];
  constructor(private patientIntakeQuestionService: PatientIntakeQuestionService) {}

  ngOnInit() {
    this.patientIntakeQuestionService
      .getPatientIntakeQuestionsByPatientId(this.patient.patientId)
      .subscribe((patientIntakeQuestions: PatientIntakeQuestion[]) => {
        this.patientIntakeQuestions = patientIntakeQuestions;
      });
  }
}
