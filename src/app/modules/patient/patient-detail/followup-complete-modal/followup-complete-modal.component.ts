import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '../../patient';
import { PatientStatusService, PatientStatus } from '../../patient-status.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  providers: [PatientStatusService],
  selector: 'app-followup-complete-modal',
  templateUrl: './followup-complete-modal.component.html',
  styleUrls: ['./followup-complete-modal.component.scss']
})
export class FollowupCompleteModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private patientStatusService: PatientStatusService
  ) {}
  @Input() patient: Patient;
  followupCompleteForm: FormGroup;
  completionTypes: PatientStatus[] = [];
  completionTypesListLeft: PatientStatus[] = [];
  completionTypesListRight: PatientStatus[] = [];

  ngOnInit() {
    this.createForm();
    this.patientStatusService.getPatientStatusLabels().subscribe((data: PatientStatus[]) => {
      this.completionTypes = data;
      var i;
      for (i = 0; i <= this.completionTypes.length; i++) {
        if (this.completionTypes[i] !== undefined) {
          this.completionTypesListLeft.push(this.completionTypes[i]);
          i++;
          if (i == this.completionTypes.length) {
            return;
          }
          this.completionTypesListRight.push(this.completionTypes[i]);
        }
      }
    });
  }
  createForm() {
    this.followupCompleteForm = this.fb.group({
      patientStatusLabelId: this.fb.control('', [Validators.required]),
      completionNotes: this.fb.control('')
    });
  }
  archivePatient(patient: Patient) {
    var formSubmission = this.followupCompleteForm.getRawValue();
    var patientStatusLabelId = formSubmission.patientStatusLabelId;
    var patientStatusNotes = formSubmission.completionNotes;
    this.patientStatusService
      .addNewPatientStatusByPatientId(patient.patientId, patientStatusLabelId, patientStatusNotes)
      .subscribe((data: any) => {
        this.dismiss();
        window.location.href = '/call-queue';
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
