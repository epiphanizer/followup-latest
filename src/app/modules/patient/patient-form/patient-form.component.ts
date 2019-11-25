import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/modules/user/user';
import { SuperForm } from 'angular-super-validator';
import { PatientPutBody } from './patient-form';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { PatientContact, PatientContactPostBody } from '../patient-contact/patient-contact';
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
  patientContactsToRemove: number[] = [];
  patientContacts$: Observable<PatientContact[]>;
  patientIntakeQuestions: PatientIntakeQuestion[] = [];
  patientIntakeQuestions$: Observable<PatientIntakeQuestion[]>;
  patientMaxAdmitDate: string = new Date().getFullYear().toString();
  // default to 2019 as our first year
  patientMinDischargeDate: string = (new Date().getFullYear() + 1).toString();
  patientMedicalConditions?: string;
  operations: Operation[];
  operations$: Observable<Operation[]>;

  user: User;
  patient$: Observable<Patient> | void;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
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
        this.patient.patientMedicalConditions = {
          cardiacBoolean: false,
          sepsisBoolean: false,
          pulmonaryBoolean: false,
          otherBoolean: false
        };
        this.createForm();
        this.addAdditionalPatientContact();
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
          this.patient.patientMedicalConditions.otherBoolean = medicalConditions.otherBoolean;
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
                  patientContactResponsiblePartyBoolean: this.fb.control(
                    patientContact.patientContactResponsiblePartyBoolean
                  )
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
          patientDischargedAma: this.fb.control(this.patient.patientDischargedAma || false, [Validators.required])
        }),
        patientMedicalConditions: this.fb.group({
          cardiacBoolean: this.fb.control(this.patient.patientMedicalConditions.cardiacBoolean),
          sepsisBoolean: this.fb.control(this.patient.patientMedicalConditions.sepsisBoolean),
          pulmonaryBoolean: this.fb.control(this.patient.patientMedicalConditions.pulmonaryBoolean),
          otherBoolean: this.fb.control(this.patient.patientMedicalConditions.otherBoolean)
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

  addAdditionalPatientContact() {
    this.patientContacts.push({
      patientContactFirstName: '',
      patientContactLastName: '',
      patientContactRelationship: '',
      patientContactCountryCode: '1',
      patientContactAreaCode: '',
      patientContactPhoneNumber: '',
      patientContactOrder: (this.patientContacts.length + 1).toString(),
      patientContactResponsiblePartyBoolean: false
    });
    let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
    let idx = patientContactArray.length;
    patientContactArray.push(
      this.fb.group({
        patientContactFirstName: this.fb.control('', [Validators.required]),
        patientContactLastName: this.fb.control('', [Validators.required]),
        patientContactRelationship: this.fb.control('', [Validators.required]),
        patientContactCountryCode: this.fb.control('1', [Validators.required]),
        patientContactAreaCode: this.fb.control('', [Validators.required]),
        patientContactPhoneNumber: this.fb.control('', [Validators.required]),
        patientContactOrder: this.fb.control(idx + 1, [Validators.required]),
        patientContactResponsiblePartyBoolean: this.fb.control(false)
      })
    );
  }

  removeAdditionalPatientContact(idx: number) {
    // Assumes we have a patient contact to begin with (is this the smartest way to do this? think on it)
    let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;

    patientContactArray.at(idx).clearValidators();
    patientContactArray.removeAt(idx);
    this.patientForm.removeControl('patient.patientContacts' + idx.toString());
    this.patientContactsToRemove.push(this.patientContacts[idx].patientContactId);
    let element: HTMLElement = document.querySelector('#additionalPatientContact-' + idx) as HTMLElement;
    element.remove();
  }

  updateDischargeFields() {
    let startDate = this.patientForm.get('patient.dischargeInfo.patientAdmitDate').value;
    let endDate = this.patientForm.get('patient.dischargeInfo.patientDischargeDate').value;
    if (!startDate || !endDate) {
      if (startDate) {
        this.patientMinDischargeDate = this.patientForm
          .get('patient.dischargeInfo.patientAdmitDate')
          .value.substr(0, 10);
      } else if (endDate) {
        this.patientMaxAdmitDate = this.patientForm
          .get('patient.dischargeInfo.patientDischargeDate')
          .value.substr(0, 10);
      }
      return;
    }
    // Have to feed back the min and max in specific formats, see https://ionicframework.com/docs/api/datetime#properties
    this.patientMaxAdmitDate = this.patientForm.get('patient.dischargeInfo.patientDischargeDate').value.substr(0, 10);
    this.patientMinDischargeDate = this.patientForm.get('patient.dischargeInfo.patientAdmitDate').value.substr(0, 10);
    // To calculate the time difference of two dates
    var timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
    var dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    this.patientForm.get('patient.dischargeInfo.patientTotalDays').setValue(dayDiff);
  }

  onFormSubmit(): void {
    if (!this.validateControls()) {
      return;
    }
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

    // Passing E2E
    this.patientContacts.forEach((patientContact: PatientContact, index: number) => {
      this.patientContacts[index] = formSubmission.patient.patientContacts[index];
      var patientContactPost = this.patientContactPostFactory(this.patientContacts[index]);
      this.patientContactService
        .addNewPatientContactByPatientId(this.patient.patientId, patientContactPost)
        .subscribe((data: any) => {
          console.log(data);
        });
    });

    let patientPutBody = this.formSubmissionFactory(formSubmission);
    this.patientService.editPatientByPatientId(this.patient.patientId, patientPutBody).subscribe(value => {
      this.router.navigate(['operations/' + this.patientForm.get('operation').value + '/patients']);
    });
  }

  patientContactPostFactory(patientContact: PatientContact): PatientContactPostBody {
    try {
      var payload = {
        patientId: this.patient.patientId,
        patientContactFirstName: patientContact.patientContactFirstName,
        patientContactLastName: patientContact.patientContactLastName,
        patientContactRelationship: patientContact.patientContactRelationship,
        patientContactCountryCode: patientContact.patientContactCountryCode,
        patientContactAreaCode: patientContact.patientContactAreaCode,
        patientContactPhoneNumber: patientContact.patientContactPhoneNumber,
        patientContactOrder: patientContact.patientContactOrder,
        patientContactResponsiblePartyBoolean: patientContact.patientContactResponsiblePartyBoolean == true ? 1 : 0
      };
      return <PatientContactPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  /**
   * create a tidy type-checked payload to send off to the API
   * we do all of our processing to agree with Swagger contract here
   * @param formSubmission
   */
  private formSubmissionFactory(formSubmission: any) {
    const patientMedicalConditions = JSON.stringify(formSubmission.patient.patientMedicalConditions);
    var payload = {
      patientDob: formSubmission.patient.patientDob,
      patientOperationId: formSubmission.operation,
      patientMedicalRecordNumber: formSubmission.patient.patientMedicalRecordNumber,
      patientFirstName: formSubmission.patient.patientName.patientFirstName,
      patientMiddleName: formSubmission.patient.patientName.patientMiddleName || '',
      patientLastName: formSubmission.patient.patientName.patientLastName,
      patientPrimaryInsurance: formSubmission.patient.insurance.primaryInsurance || '',
      patientSecondaryInsurance: formSubmission.patient.insurance.secondaryInsurance || '',
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

  /**
   * A function to validate controls,
   * and if there are any validation errors,
   * bounce the user to the top.
   */
  validateControls(): boolean {
    console.log('Finding invalid controls...');
    const errors = SuperForm.getAllErrors(this.patientForm);
    console.log(JSON.stringify(errors));
    const errorsFlat = SuperForm.getAllErrorsFlat(this.patientForm);
    console.log(JSON.stringify(errorsFlat));
    // Double check this
    const firstError = <HTMLElement>document.getElementsByClassName('ng-invalid')[0];

    function scroll(el: HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (firstError) {
      scroll(firstError);
      return false;
    } else {
      return true;
    }
  }
}
