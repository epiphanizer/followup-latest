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
  completionSaveError: string | null = null;
  isSaving: boolean = false;

  ngOnInit() {
    this.createForm();
    this.loadCompletionTypes();
  }

  loadCompletionTypes() {
    this.completionTypesLoading = true;
    this.completionTypesError = null;

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
    if (this.isSaving || this.followupCompleteForm.invalid) {
      this.followupCompleteForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.completionSaveError = null;
    var formSubmission = this.followupCompleteForm.getRawValue();
    var patientStatusLabelId = formSubmission.patientStatusLabelId;
    var patientStatusNotes = formSubmission.completionNotes;
    this.patientStatusService
      .addPatientStatusByPatientId(patient.patientId, patientStatusLabelId, patientStatusNotes)
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => {
          this.dismissSuccess();
        },
        error: () => {
          this.completionSaveError = 'Follow-up was not completed. Your selection and notes are still here; please try again.';
        }
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
