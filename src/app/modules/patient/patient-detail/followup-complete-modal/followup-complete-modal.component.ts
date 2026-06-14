import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '../../patient';
import { PatientStatusService, PatientStatus } from '../../patient-status.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { take, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-followup-complete-modal',
  templateUrl: './followup-complete-modal.component.html',
  styleUrls: ['./followup-complete-modal.component.scss'],
  standalone: false
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
  completionTypesLoading: boolean = true;
  completionTypesError: string | null = null;

  ngOnInit() {
    this.createForm();
    this.patientStatusService
      .getPatientStatusLabels()
      .pipe(
        take(1),
        finalize(() => {
          this.completionTypesLoading = false;
        })
      )
      .subscribe({
        next: (data: PatientStatus[] | null) => {
          this.completionTypes = Array.isArray(data) ? data : [];
          this.completionTypesError = null;
        },
        error: () => {
          this.completionTypes = [];
          this.completionTypesError = 'Unable to load completion options.';
        }
      });
  }
  createForm() {
    this.followupCompleteForm = this.fb.group({
      patientStatusLabelId: this.fb.control('', [Validators.required]),
      completionNotes: this.fb.control('')
    });
  }

  isCompletionTypeSelected(patientStatusLabelId: string): boolean {
    return this.followupCompleteForm?.get('patientStatusLabelId')?.value === patientStatusLabelId;
  }

  onCompletionTypeChange(patientStatusLabelId: string, checked: boolean) {
    const control = this.followupCompleteForm?.get('patientStatusLabelId');

    if (!control) {
      return;
    }

    if (checked) {
      control.setValue(patientStatusLabelId);
      return;
    }

    if (control.value === patientStatusLabelId) {
      control.setValue('');
    }
  }

  archivePatient(patient: Patient) {
    var formSubmission = this.followupCompleteForm.getRawValue();
    var patientStatusLabelId = formSubmission.patientStatusLabelId;
    var patientStatusNotes = formSubmission.completionNotes;
    this.patientStatusService
      .addPatientStatusByPatientId(patient.patientId, patientStatusLabelId, patientStatusNotes)
      .subscribe((data: any) => {
        // Emitter here
        this.dismissSuccess();
      });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }
  dismissSuccess() {
    this.modalCtrl.dismiss({
      dismissed: false
    });
  }
}
