import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user.service';
import { map } from 'rxjs/operators';
import { PatientPutBody } from './patient-form';

@Component({
  providers: [PatientService],
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  dischargeLabels: PatientDischargeLabel[];
  dischargeLabels$: Observable<PatientDischargeLabel[]>;
  patientForm: FormGroup;
  currentYear: number;
  editMode: boolean = false;
  patient: Patient;
  status: {
    submitted: null | boolean;
  };
  user: User;
  patient$: Observable<Patient> | void;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private patientService: PatientService) {}

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
        console.log(data);
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
    debugger;
    let payload = this.formSubmissionFactory(formSubmission);
    console.log(payload);
    this.patientService.editPatientByPatientId(this.patient.patientId, payload).subscribe(value => {
      console.log(value);
      return (this.status.submitted = true);
    });
    alert('submitting form');
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
      operation: this.fb.control(''),
      patient: this.fb.group({
        patientMedicalRecordNumber: this.fb.control(''),
        patientName: this.fb.group({
          patientFirstName: this.fb.control(''),
          patientMiddleName: this.fb.control(''),
          patientLastName: this.fb.control('')
        }),
        patientDob: this.fb.control(''),
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
          physicianFirstName: this.fb.control(''),
          physicianLastName: this.fb.control(''),
          physicianCountryCode: this.fb.control(''),
          physicianAreaCode: this.fb.control(''),
          physicianPhoneNumber: this.fb.control('')
        }),
        insurance: this.fb.group({
          primaryInsurance: this.fb.control(''),
          secondaryInsurance: this.fb.control('')
        }),
        dischargeInfo: this.fb.group({
          patientAdmissionDate: this.fb.control(''),
          patientDischargeDate: this.fb.control(''),
          patientTotalDays: this.fb.control(''),
          patientDischargedTo: this.fb.control(''),
          patientDischargedAma: this.fb.control('')
        }),
        patientMedicalConditions: this.fb.group({
          cardiacBoolean: this.fb.control(''),
          sepsisBoolean: this.fb.control(''),
          pulmonaryBoolean: this.fb.control(''),
          primaryDiagnosis: this.fb.control(''),
          dischargedCondition: this.fb.control('')
        }),
        patientQuestionAnswers: this.fb.group({}),
        patientUrgencyRating: this.fb.control(''),
        patientNeedToKnow: this.fb.control('')
      })
    });
  }
  setPatientQuestionAnswers() {
    // this.appForm;
  }
  uploadPatientAvatarPhoto() {
    alert('adding patient photo');
  }
}
