import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../patient.service';
import { Patient } from '../../patient';
import { PatientStatusService, PatientStatus } from '../../patient-status.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-followup-complete-modal',
  templateUrl: './followup-complete-modal.component.html',
  styleUrls: ['./followup-complete-modal.component.scss']
})
export class FollowupCompleteModalComponent implements OnInit {
  patientStatuses: PatientStatus[];
  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private patientStatusService: PatientStatusService
  ) {}
  @Input() patient: Patient;
  followupCompleteForm: FormGroup;

  ngOnInit() {
    this.patientStatuses = this.patientStatusService.getPatientStatusLabels();
  }
  createForm() {
    this.followupCompleteForm = this.fb.group({
      // patientStatusLabelId: this.fb.control()
    });
  }
  archivePatient() {
    alert('Archiving patient');
    var formSubmission = this.followupCompleteForm.getRawValue();
    var patientStatusLabelId = 1;
    debugger;
    this.patientStatusService.addNewPatientStatusByPatientId(this.patient.patientId, patientStatusLabelId);
  }
}
