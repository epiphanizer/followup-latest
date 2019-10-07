import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { map } from 'rxjs/operators';
import { PatientPutBody } from './patient-form';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  providers: [PatientService],
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  avatarUrl: SafeUrl;
  dischargeLabels: PatientDischargeLabel[];
  dischargeLabels$: Observable<PatientDischargeLabel[]>;
  patientForm: FormGroup;
  currentYear: number;
  editMode: boolean = false;
  fileToUpload: File;
  patient: Patient;
  status: {
    submitted: null | boolean;
  };
  user: User;
  patient$: Observable<Patient> | void;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private patientAvatarService: PatientAvatarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    /**
     * See if we are editing the form
     */
    this.user = this.route.snapshot.data.user;

    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
      this.patient = this.route.snapshot.data.patient;
    }
    if (!this.patient) {
      this.patient$ = this.patientService.addNewPatient().pipe(
        map((data: Patient) => {
          this.patient = data;
          this.createForm();
          return data;
        })
      );
    } else {
      this.patientService.getPatientByPatientId(this.patient.patientId).subscribe((data: any) => {
        this.patient = data;
        if (this.patient.avatar) {
          let unsafeImageUrl = URL.createObjectURL(this.patient.avatar);
          this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
        }
      });
      this.createForm();

      var patientFormControls = this.patientForm.get('patient') as FormGroup;
      debugger;
      // patientFormControls.controls.patientFirstName.setValue(this.patient.patientFirstName);
      // patientFormControls.controls.patientMiddleName.setValue(this.patient.patientMiddleName);
      // patientFormControls.controls.patientLastName.setValue(this.patient.patientLastName);
      // var physicianInfoFormControls = this.patientForm.get('patient.physicianInfo') as FormGroup;
      // physicianInfoFormControls.controls.patientPhysicianFirstName.setValue(this.patient.patientPhysicianFirstName);
      // physicianInfoFormControls.controls.patientPhysicianLastName.setValue(this.patient.patientPhysicianLastName);
      // physicianInfoFormControls.controls.physicianCountryCode.setValue(this.patient.patientPhysicianCountryCode);
      // physicianInfoFormControls.controls.physicianAreaCode.setValue(this.patient.patientPhysicianAreaCode);
      // physicianInfoFormControls.controls.physicianPhoneNumber.setValue(this.patient.patientPhysicianPhoneNumber);
    }
    this.dischargeLabels$ = this.patientService.getPatientDischargeLabels();
  }

  onFormSubmit(): void {
    let formSubmission = this.patientForm.getRawValue();
    let payload = this.formSubmissionFactory(formSubmission);
    this.patientService.editPatientByPatientId(this.patient.patientId, payload).subscribe(value => {
      console.log(value);
      return (this.status.submitted = true);
    });
    debugger;
  }

  /**
   * create a tidy type-checked payload to send off to the API
   * @param formSubmission
   */
  private formSubmissionFactory(formSubmission: any) {
    console.log(formSubmission);
    var payload = {
      patientActive: formSubmission.patient.patientActive,
      patientDob: formSubmission.patient.patientDob,
      patientOperationId: formSubmission.operation,
      patientMedicalRecordNumber: formSubmission.patient.medicalRecordNumber,
      patientFirstName: formSubmission.patient.patientFirstName,
      patientMiddleName: formSubmission.patient.patientMiddleName,
      patientLastName: formSubmission.patient.patientLastName,
      patientPhysicianFirstName: formSubmission.physicianInfo.physicianFirstName,
      patientPhysicianLastName: formSubmission.physicianInfo.physicianLastName,
      patientPhysicianCountryCode: formSubmission.physicianInfo.physicianCountryCode,
      patientPhysicianAreaCode: formSubmission.physicianInfo.physicianAreaCode,
      patientPhysicianPhoneNumber: formSubmission.physicianInfo.physicianPhoneNumber,
      patientPrimaryInsurance: formSubmission.insurance.primaryInsurance,
      patientSecondaryInsurance: formSubmission.insurance.secondaryInsurance,
      patientAdmissionDate: formSubmission.dischargeInfo.patientAdmissionDate,
      patientDischargeDate: formSubmission.dischargeInfo.patientDischargeDate,
      patientDischargedAma: formSubmission.dischargeInfo.patientDischargedAma,
      patientDischargeLocationLabelId: formSubmission.dischargeInfo.patientDischargedTo,
      patientPrimaryDiagnosis: formSubmission.patientMedicalConditions.primaryDiagnosis,
      // patientDiagnosis: {},
      patientQuestionAnswers: formSubmission.patientQuestionAnswers,
      patientUrgencyScale: formSubmission.patientUrgencyScale,
      patientNeedToKnow: formSubmission.patientNeedToKnow
    };
    debugger;

    return <PatientPutBody>payload;
  }
  private createForm() {
    this.patientForm = this.fb.group({
      operation: this.fb.control(this.patient.patientOperationName),
      patient: this.fb.group({
        patientMedicalRecordNumber: this.fb.control(this.patient.patientOperationName),
        patientName: this.fb.group({
          patientFirstName: this.fb.control(this.patient.patientFirstName),
          patientMiddleName: this.fb.control(this.patient.patientMiddleName),
          patientLastName: this.fb.control(this.patient.patientLastName)
        }),
        patientDob: this.fb.control(this.patient.patientDob),
        patientContacts: this.fb.group({
          primaryPatientContact: this.fb.group({
            patientContactFirstName: this.fb.control(''),
            patientContactLastName: this.fb.control(''),
            patientContactRelationship: this.fb.control(''),
            patientContactCountryCode: this.fb.control(''),
            patientContactAreaCode: this.fb.control(''),
            patientContactPhoneNumber: this.fb.control(''),
            patientResponsiblePartyBoolean: this.fb.control('')
          }),
          alternatePatientContact1: this.fb.group({
            patientContactFirstName: this.fb.control(''),
            patientContactLastName: this.fb.control(''),
            patientContactRelationship: this.fb.control(''),
            patientContactCountryCode: this.fb.control(''),
            patientContactAreaCode: this.fb.control(''),
            patientContactPhoneNumber: this.fb.control(''),
            patientResponsiblePartyBoolean: this.fb.control('')
          }),
          alternatePatientContact2: this.fb.group({
            patientContactFirstName: this.fb.control(''),
            patientContactLastName: this.fb.control(''),
            patientContactRelationship: this.fb.control(''),
            patientContactCountryCode: this.fb.control(''),
            patientContactAreaCode: this.fb.control(''),
            patientContactPhoneNumber: this.fb.control(''),
            patientResponsiblePartyBoolean: this.fb.control('')
          })
        }),
        physicianInfo: this.fb.group({
          physicianFirstName: this.fb.control(this.patient.patientPhysicianFirstName),
          physicianLastName: this.fb.control(this.patient.patientPhysicianLastName),
          physicianCountryCode: this.fb.control(this.patient.patientPhysicianCountryCode),
          physicianAreaCode: this.fb.control(this.patient.patientPhysicianAreaCode),
          physicianPhoneNumber: this.fb.control(this.patient.patientPhysicianPhoneNumber)
        }),
        insurance: this.fb.group({
          primaryInsurance: this.fb.control(this.patient.patientPrimaryInsurance),
          secondaryInsurance: this.fb.control(this.patient.patientSecondaryInsurance)
        }),
        dischargeInfo: this.fb.group({
          patientAdmissionDate: this.fb.control(this.patient.patientAdmitDate),
          patientDischargeDate: this.fb.control(this.patient.patientDischargeDate),
          patientTotalDays: this.fb.control(this.patient.patientTotalDays),
          patientDischargedTo: this.fb.control(this.patient.patientDischargeLabel),
          patientDischargedAma: this.fb.control(this.patient.patientDischargedAma)
        }),
        patientMedicalConditions: this.fb.group({
          cardiacBoolean: this.fb.control(this.patient.patientDischargedConditions.cardiac),
          sepsisBoolean: this.fb.control(this.patient.patientDischargedConditions.sepsis),
          pulmonaryBoolean: this.fb.control(this.patient.patientDischargedConditions.pulmonary),
          primaryDiagnosis: this.fb.control(this.patient.patientDiagnosis),
          dischargedCondition: this.fb.control(this.patient.patientDiagnosis)
        }),
        patientQuestionAnswers: this.fb.group({}),
        patientUrgencyRating: this.fb.control(this.patient.patientUrgencyRating),
        patientNeedToKnow: this.fb.control(this.patient.patientUrgencyRating)
      })
    });
  }
  clickUploadInput() {
    let element: HTMLElement = document.querySelector('#fileUpload') as HTMLElement;
    element.click();
  }
  uploadPatientAvatarPhoto(files: FileList) {
    this.fileToUpload = files.item(0);
    this.patientAvatarService
      .uploadPatientAvatarByPatientId(this.patient.patientId, this.fileToUpload)
      .subscribe((data: any) => {
        alert('upload successful');
        // refine
        location.reload();
      });
  }
}
