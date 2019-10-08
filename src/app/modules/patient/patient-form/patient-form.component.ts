import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { map } from 'rxjs/operators';
import { PatientPutBody } from './patient-form';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { PatientContact } from '../patient-contact/patient-contact';
import { Operation, OperationService } from '@app/modules/operation/operation.service';

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
  fileToUpload: File;
  patient: Patient;
  patientContacts: PatientContact[];
  operations: Operation[];
  operations$: Observable<Operation[]>;

  user: User;
  patient$: Observable<Patient> | void;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private operationService: OperationService,
    private patientService: PatientService,
    private patientAvatarService: PatientAvatarService
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
        this.patient = data[0];
        this.createForm();
      });
    }
    this.operations$ = this.operationService.getAllOperations();
    this.dischargeLabels$ = this.patientService.getPatientDischargeLabels();
    this.patient.patientContacts$.subscribe((patientContacts: PatientContact[]) => {
      let patientContactArray = this.patientForm.controls.patient.get('patientContacts') as FormArray;
      patientContacts.forEach((patientContact: PatientContact) => {
        patientContactArray.push(
          this.fb.group({
            patientContactFirstName: this.fb.control(patientContact.patientContactFirstName),
            patientContactLastName: this.fb.control(patientContact.patientContactLastName),
            patientContactRelationship: this.fb.control(patientContact.patientContactRelationship),
            patientContactCountryCode: this.fb.control(patientContact.patientContactCountryCode),
            patientContactAreaCode: this.fb.control(patientContact.patientContactAreaCode),
            patientContactPhoneNumber: this.fb.control(patientContact.patientContactPhoneNumber),
            patientResponsiblePartyBoolean: this.fb.control(false)
          })
        );
      });
      this.patientContacts = patientContacts;
      return this.patientContacts;
    });
  }

  onFormSubmit(): void {
    let formSubmission = this.patientForm.getRawValue();
    let patientPutBody = this.formSubmissionFactory(formSubmission);
    this.patientService.editPatientByPatientId(this.patient.patientId, patientPutBody).subscribe(value => {
      alert('patient successfully edited');
      location.reload();
    });
  }

  /**
   * create a tidy type-checked payload to send off to the API
   * @param formSubmission
   */
  private formSubmissionFactory(formSubmission: any) {
    const patientIntakeQuestionAnswers = JSON.stringify(formSubmission.patientIntakeQuestionAnswers);
    const patientDiagnosis = JSON.stringify(formSubmission.patientDiagnosis);
    var payload = {
      patientDob: formSubmission.patient.patientDob,
      patientOperationId: formSubmission.operation,
      patientMedicalRecordNumber: formSubmission.patient.medicalRecordNumber,
      patientFirstName: formSubmission.patient.patientFirstName,
      patientMiddleName: formSubmission.patient.patientMiddleName,
      patientLastName: formSubmission.patient.patientLastName,
      patientAdmitDate: formSubmission.dischargeInfo.patientAdmitDate,
      patientPhysicianFirstName: formSubmission.physicianInfo.physicianFirstName,
      patientPhysicianLastName: formSubmission.physicianInfo.physicianLastName,
      patientPhysicianCountryCode: formSubmission.physicianInfo.physicianCountryCode,
      patientPhysicianAreaCode: formSubmission.physicianInfo.physicianAreaCode,
      patientPhysicianPhoneNumber: formSubmission.physicianInfo.physicianPhoneNumber,
      patientPrimaryInsurance: formSubmission.insurance.primaryInsurance,
      patientSecondaryInsurance: formSubmission.insurance.secondaryInsurance,
      patientDischargeDate: formSubmission.dischargeInfo.patientDischargeDate,
      patientDischargedAma: formSubmission.dischargeInfo.patientDischargedAma,
      patientDischargeLocationLabelId: formSubmission.dischargeInfo.patientDischargedTo,
      patientPrimaryDiagnosis: formSubmission.patientMedicalConditions.primaryDiagnosis,
      patientDiagnosis: patientDiagnosis,
      patientIntakeQuestionAnswers: patientIntakeQuestionAnswers,
      patientUrgencyScale: formSubmission.patientUrgencyScale,
      patientNeedToKnow: formSubmission.patientNeedToKnow
    };
    return <PatientPutBody>payload;
  }
  private createForm() {
    this.patientForm = this.fb.group({
      operation: this.fb.control(this.patient.patientOperationId),
      patient: this.fb.group({
        patientMedicalRecordNumber: this.fb.control(this.patient.patientMedicalRecordNumber, [Validators.required]),
        patientName: this.fb.group({
          patientFirstName: this.fb.control(this.patient.patientFirstName, [Validators.required]),
          patientMiddleName: this.fb.control(this.patient.patientMiddleName),
          patientLastName: this.fb.control(this.patient.patientLastName, [Validators.required])
        }),
        patientDob: this.fb.control(this.patient.patientDob, [Validators.required]),
        patientContacts: this.fb.array([]),

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
          patientAdmitDate: this.fb.control(this.patient.patientAdmitDate, [Validators.required]),
          patientDischargeDate: this.fb.control(this.patient.patientDischargeDate, [Validators.required]),
          patientTotalDays: this.fb.control({ disabled: true, value: this.patient.patientTotalDays }),
          patientDischargedTo: this.fb.control(this.patient.patientDischargeLabelId, [Validators.required]),
          patientDischargedAma: this.fb.control(this.patient.patientDischargedAma, [Validators.required])
        }),
        patientMedicalConditions: this.fb.group({
          // cardiacBoolean: this.fb.control(this.patient.patientDischargedConditions.cardiac),
          // sepsisBoolean: this.fb.control(this.patient.patientDischargedConditions.sepsis),
          // pulmonaryBoolean: this.fb.control(this.patient.patientDischargedConditions.pulmonary),
          // dischargedCondition: this.fb.control(this.patient.patientDischargedConditions.patientDischargedCondition)

          cardiacBoolean: this.fb.control(false),
          sepsisBoolean: this.fb.control(false),
          pulmonaryBoolean: this.fb.control(false),
          primaryDiagnosis: this.fb.control(this.patient.patientDiagnosis),
          dischargedCondition: this.fb.control(this.patient.patientDischargeNotes)
        }),
        patientIntakeQuestionAnswers: this.fb.array([]),
        patientUrgencyRating: this.fb.control(this.patient.patientUrgencyRating),
        patientNeedToKnow: this.fb.control(this.patient.patientNeedToKnow)
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
