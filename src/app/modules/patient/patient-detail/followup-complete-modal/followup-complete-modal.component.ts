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
  patientStatuses: PatientStatus[];
  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
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
    var formSubmission = this.followupCompleteForm.getRawValue();
    var patientStatusLabelId = 5;
    // debugger;
    this.patientStatusService.addNewPatientStatusByPatientId(this.patient.patientId, patientStatusLabelId);
    this.dismiss();
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
}
