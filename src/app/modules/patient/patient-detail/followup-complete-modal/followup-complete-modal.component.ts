import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../patient.service';
import { Patient } from '../../patient';
import { PatientStatusService, PatientStatus } from '../../patient-status.service';
import { FormGroup, FormBuilder } from '@angular/forms';
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
    private patientService: PatientService,
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
      for (i = 0; i <= this.completionTypes.length; i = i + 2) {
        if (this.completionTypes[i] !== undefined) {
          this.completionTypesListLeft.push(this.completionTypes[i]);
          this.completionTypesListRight.push(this.completionTypes[i + 1]);
        }
      }
    });
  }
  createForm() {
    this.followupCompleteForm = this.fb.group({
      patientStatusLabelId: this.fb.control(''),
      completionNotes: this.fb.control('')
    });
  }
  archivePatient() {
    var formSubmission = this.followupCompleteForm.getRawValue();
    var patientStatusLabelId = formSubmission.patientStatusLabelId;
    var patientStatusNotes = formSubmission.completionNotes;
    debugger;
    this.patientStatusService
      .addNewPatientStatusByPatientId(this.patient.patientId, patientStatusLabelId, patientStatusNotes)
      .subscribe((data: any) => {
        this.dismiss();
        window.location.href = '/call-queue';
      });
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
