import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { PatientPutBody } from './patient-form';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { PatientContact } from '../patient-contact/patient-contact';
import { OperationService } from '@app/modules/operation/operation.service';
import { PatientContactService } from '../patient-contact/patient-contact.service';
import { Operation } from '@app/modules/operation/operation';
import {
  PatientIntakeQuestion,
  PatientIntakeQuestionAnswer
} from '../patient-intake-question/patient-intake-question.component';
import { PatientIntakeQuestionService } from '../patient-intake-question/patient-intake-question.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  providers: [PatientService, PatientIntakeQuestionService],
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  avatarExists: Boolean;
  public avatarUrl: SafeUrl;
  dischargeLabels: PatientDischargeLabel[];
  dischargeLabels$: Observable<PatientDischargeLabel[]>;
  patientForm: FormGroup;
  currentYear: number;
  editMode: boolean = false;
  fileToUpload: File;
  patient: Patient;
  patientContacts: PatientContact[] = [];
  patientContacts$: Observable<PatientContact[]>;
  patientIntakeQuestions: PatientIntakeQuestion[] = [];
  patientIntakeQuestions$: Observable<PatientIntakeQuestion[]>;
  patientMedicalConditions?: string;
  operations: Operation[];
  operations$: Observable<Operation[]>;

  user: User;
  patient$: Observable<Patient> | void;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private operationService: OperationService,
    private patientService: PatientService,
    private patientAvatarService: PatientAvatarService,
    private patientContactService: PatientContactService,
    private patientIntakeQuestionService: PatientIntakeQuestionService
  ) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.user = this.route.snapshot.data.user;
    this.operations$ = this.operationService.getAllOperations();
    this.dischargeLabels$ = this.patientService.getPatientDischargeLabels();

    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
      this.patient = this.route.snapshot.data.patient;
    }
    if (!this.patient) {
      /**
       * Creating a shell of the patient object within the database first
       * allows us to post avatars, uploads, etc. to a known patientId
       * even before the patient is "real".
       */
      this.patientService.addNewPatient().subscribe((data: any) => {
        if (data.patientId) {
          let patientId = data.patientId;
          this.patient = {
            patientId: patientId
          };
        }
        this.createForm();
        this.addAdditionalContact();
        this.patientIntakeQuestionService
          .getPatientIntakeQuestionsByPatientId(this.patient.patientId)
          .subscribe((patientIntakeQuestions: PatientIntakeQuestion[]) => {
            let patientIntakeQuestionAnswers = this.patientForm.get(
              'patient.patientIntakeQuestionAnswers'
            ) as FormArray;
            patientIntakeQuestions.forEach((patientIntakeQuestion: PatientIntakeQuestion, index: number) => {
              let patientIntakeQuestionId = patientIntakeQuestion['patientIntakeQuestionId'].toString();
              let newFormGroup = this.fb.group({});
              let newControl = new FormControl('');
              newFormGroup.addControl(patientIntakeQuestionId, newControl);
              patientIntakeQuestionAnswers.push(newFormGroup);
              this.patientIntakeQuestions.push(patientIntakeQuestion);
            });
          });
      });
    } else {
      this.patientService.getPatientByPatientId(this.patient.patientId).subscribe((data: Patient) => {
        this.patient = data[0];
        let medicalConditions = JSON.parse(this.patient.patientMedicalConditions);
        // Once we've got our data set from JSON, let's re-set the individual properties.
        this.patient.patientMedicalConditions = {};
        if (medicalConditions !== null) {
          this.patient.patientMedicalConditions.sepsisBoolean = medicalConditions.sepsisBoolean;
          this.patient.patientMedicalConditions.cardiacBoolean = medicalConditions.cardiacBoolean;
          this.patient.patientMedicalConditions.pulmonaryBoolean = medicalConditions.pulmonaryBoolean;
        }
        // See if we have an avatar to load in
        this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((baseImage: any) => {
          if (baseImage !== null) {
            if (!baseImage[0]) {
              this.avatarExists = false;
            } else {
              this.avatarExists = true;
              this.avatarUrl = this.patientAvatarService.prepareAvatarImage(baseImage);
            }
          }
        });
        this.createForm();
        this.addAdditionalContact();
        this.patientContacts$ = this.patientContactService.getPatientContactsByPatientId(this.patient.patientId);
        this.patientContacts$.subscribe((patientContacts: PatientContact[]) => {
          let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
          if (patientContacts) {
            this.patientContacts.splice(0, 1);
            patientContacts.forEach((patientContact: PatientContact) => {
              patientContactArray.push(
                this.fb.group({
                  patientContactFirstName: this.fb.control(patientContact.patientContactFirstName),
                  patientContactLastName: this.fb.control(patientContact.patientContactLastName),
                  patientContactRelationship: this.fb.control(patientContact.patientContactRelationship),
                  patientContactCountryCode: this.fb.control(patientContact.patientContactCountryCode),
                  patientContactAreaCode: this.fb.control(patientContact.patientContactAreaCode),
                  patientContactPhoneNumber: this.fb.control(patientContact.patientContactPhoneNumber),
                  patientContactOrder: this.fb.control(patientContact.patientContactOrder),
                  patientResponsiblePartyBoolean: this.fb.control(patientContact.patientResponsiblePartyBoolean)
                })
              );
              this.patientContacts.push(patientContact);
            });
          }
        });

        this.patientIntakeQuestionService
          .getPatientIntakeQuestionsByPatientId(this.patient.patientId)
          .subscribe((patientIntakeQuestions: PatientIntakeQuestion[]) => {
            let patientIntakeQuestionAnswers = this.patientForm.get(
              'patient.patientIntakeQuestionAnswers'
            ) as FormArray;
            patientIntakeQuestions.forEach((patientIntakeQuestion: PatientIntakeQuestion, index: number) => {
              let patientIntakeQuestionId = patientIntakeQuestion['patientIntakeQuestionId'].toString();
              let newFormGroup = this.fb.group({});
              let newControl = new FormControl('');
              newFormGroup.addControl(patientIntakeQuestionId, newControl);
              patientIntakeQuestionAnswers.push(newFormGroup);
              this.patientIntakeQuestions.push(patientIntakeQuestion);
            });
          });
      });
    }
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
          patientTotalDays: this.fb.control({
            disabled: true,
            value: this.patient.patientTotalDays
          }),
          patientDischargedTo: this.fb.control(this.patient.patientDischargeLabelId || '1', [Validators.required]),
          patientDischargedAma: this.fb.control(this.patient.patientDischargedAma || '0', [Validators.required])
        }),
        patientMedicalConditions: this.fb.group({
          cardiacBoolean: this.fb.control(this.patient.patientMedicalConditions.cardiacBoolean || false),
          sepsisBoolean: this.fb.control(this.patient.patientMedicalConditions.sepsisBoolean || false),
          pulmonaryBoolean: this.fb.control(this.patient.patientMedicalConditions.pulmonaryBoolean || false)
        }),
        patientPrimaryDiagnosis: this.fb.control(this.patient.patientPrimaryDiagnosis),
        patientDischargedCondition: this.fb.control(this.patient.patientDischargedCondition),
        patientIntakeQuestionAnswers: this.fb.array([]),
        patientUrgencyScale: this.fb.control({ value: this.patient.patientUrgencyScale }),
        patientNeedToKnow: this.fb.control(this.patient.patientNeedToKnow),
        patientActive: this.fb.control(this.patient.patientActive)
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
        alert('Successfully uploaded patient avatar!');
        this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((baseImage: any) => {
          if (baseImage !== null) {
            if (!baseImage[0]) {
              this.avatarExists = false;
            } else {
              this.avatarExists = true;
              this.avatarUrl = this.patientAvatarService.prepareAvatarImage(baseImage);
            }
          }
        });
      });
  }

  addAdditionalContact() {
    this.patientContacts.push({
      patientContactFirstName: '',
      patientContactLastName: '',
      patientContactRelationship: '',
      patientContactCountryCode: '',
      patientContactAreaCode: '',
      patientContactPhoneNumber: '',
      patientContactOrder: 1,
      patientResponsiblePartyBoolean: false
    });
    let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
    patientContactArray.push(
      this.fb.group({
        patientContactFirstName: this.fb.control('', [Validators.required]),
        patientContactLastName: this.fb.control('', [Validators.required]),
        patientContactRelationship: this.fb.control('', [Validators.required]),
        patientContactCountryCode: this.fb.control('', [Validators.required]),
        patientContactAreaCode: this.fb.control('', [Validators.required]),
        patientContactPhoneNumber: this.fb.control('', [Validators.required]),
        patientContactOrder: this.fb.control('', [Validators.required]),
        patientResponsiblePartyBoolean: this.fb.control(false)
      })
    );
  }
  onFormSubmit(): void {
    let formSubmission = this.patientForm.getRawValue();
    /**
     * Run processing on our patient intake questions
     */
    let intakeAnswers = this.patientForm.controls.patient.get('patientIntakeQuestionAnswers') as FormArray;
    let intakeAnswersArray = intakeAnswers.getRawValue();
    intakeAnswersArray.forEach((patientIntakeQuestionAnswer: PatientIntakeQuestionAnswer) => {
      var patientIntakeQuestionId = parseInt(Object.keys(patientIntakeQuestionAnswer).toString());
      var patientQuestionAnswer = patientIntakeQuestionAnswer[0];
      this.patientIntakeQuestionService
        .addPatientIntakeQuestionAnswerByPatientIntakeQuestionId(patientIntakeQuestionId, patientQuestionAnswer)
        .subscribe((data: any) => {});
    });
    let patientPutBody = this.formSubmissionFactory(formSubmission);
    console.log(patientPutBody);
    debugger;
    this.patientService.editPatientByPatientId(this.patient.patientId, patientPutBody).subscribe(value => {
      console.log(value);
      alert('Patient successfully edited');
      location.reload();
    });
  }

  /**
   * create a tidy type-checked payload to send off to the API
   * we do all of our processing to agree with Swagger contract here
   * @param formSubmission
   */
  private formSubmissionFactory(formSubmission: any) {
    console.log(formSubmission);
    const patientMedicalConditions = JSON.stringify(formSubmission.patient.patientMedicalConditions);
    var payload = {
      patientDob: formSubmission.patient.patientDob,
      patientOperationId: formSubmission.operation,
      patientMedicalRecordNumber: formSubmission.patient.patientMedicalRecordNumber,
      patientFirstName: formSubmission.patient.patientName.patientFirstName,
      patientMiddleName: formSubmission.patient.patientName.patientMiddleName,
      patientLastName: formSubmission.patient.patientName.patientLastName,
      patientPhysicianFirstName: formSubmission.patient.physicianInfo.physicianFirstName || '',
      patientPhysicianLastName: formSubmission.patient.physicianInfo.physicianLastName || '',
      patientPhysicianCountryCode: formSubmission.patient.physicianInfo.physicianCountryCode || '',
      patientPhysicianAreaCode: formSubmission.patient.physicianInfo.physicianAreaCode || '',
      patientPhysicianPhoneNumber: formSubmission.patient.physicianInfo.physicianPhoneNumber || '',
      patientPrimaryInsurance: formSubmission.patient.insurance.primaryInsurance,
      patientSecondaryInsurance: formSubmission.patient.insurance.secondaryInsurance,
      patientAdmitDate: formSubmission.patient.dischargeInfo.patientAdmitDate,
      patientDischargeDate: formSubmission.patient.dischargeInfo.patientDischargeDate,
      patientDischargedAma: formSubmission.patient.dischargeInfo.patientDischargedAma == true ? 1 : 0,
      patientDischargeLabelId: parseInt(formSubmission.patient.dischargeInfo.patientDischargedTo),
      patientDischargedCondition: formSubmission.patient.patientDischargedCondition,
      patientPrimaryDiagnosis: formSubmission.patient.patientPrimaryDiagnosis,
      patientMedicalConditions: patientMedicalConditions,
      patientUrgencyScale: parseInt(formSubmission.patient.patientUrgencyScale) || 1,
      patientNeedToKnow: formSubmission.patient.patientNeedToKnow || '',
      patientActive: formSubmission.patient.patientActive == true ? 1 : 0
    };
    return <PatientPutBody>payload;
  }
}
