import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { User } from '@app/modules/user/user';
import { SuperForm } from 'angular-super-validator';
import { PatientPutBody } from './patient-form';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { PatientContact, PatientContactPostBody, PatientContactPutBody } from '../patient-contact/patient-contact';
import { OperationService } from '@app/modules/operation/operation.service';
import { PatientContactService } from '../patient-contact/patient-contact.service';
import { Operation } from '@app/modules/operation/operation';
import {
  PatientIntakeQuestion,
  PatientIntakeQuestionAnswer
} from '../patient-intake-question/patient-intake-question.component';
import { PatientIntakeQuestionService } from '../patient-intake-question/patient-intake-question.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  providers: [NgxImageCompressService, PatientService, PatientIntakeQuestionService],
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  avatarExists: Boolean;
  public avatarUrl: SafeStyle;
  dischargeLabels: PatientDischargeLabel[];
  patientForm: FormGroup;
  currentYear: number;
  editMode: boolean = false;
  patient: Patient;
  patient$: Observable<Patient> | void;
  patientContacts: PatientContact[] = [];
  patientContactsOriginal: PatientContact[] = [];
  patientContactsToAdd: PatientContact[] = [];
  patientContactsToEdit: PatientContact[] = [];
  patientContactsToRemove: number[] = [];
  patientContacts$: Observable<PatientContact[]>;
  patientIntakeQuestions: PatientIntakeQuestion[] = [];
  patientIntakeQuestions$: Observable<PatientIntakeQuestion[]>;
  patientIntakeQuestionAnswersOriginal: {
    patientIntakeQuestionId: number;
    patientIntakeQuestionAnswer: number;
  }[] = [];
  patientIntakeQuestionAnswers: PatientIntakeQuestionAnswer[] = [];
  patientIntakeQuestionAnswersToAdd: PatientIntakeQuestionAnswer[] = [];
  patientMaxAdmitDate: string = new Date().getFullYear().toString();
  // default to 2019 as our first year
  patientMinDischargeDate: string = (new Date().getFullYear() + 1).toString();
  patientMedicalConditions?: string;
  operations: Operation[];
  operations$: Observable<Operation[]>;
  stringMinimumOneWordRegEx = RegExp(/^(?!\s*$).+/);

  user: User;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private operationService: OperationService,
    private patientService: PatientService,
    private patientContactService: PatientContactService,
    private patientIntakeQuestionService: PatientIntakeQuestionService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.user = this.route.snapshot.data.user;
    this.operationService.getAllOperations().subscribe((operations: Operation[]) => {
      this.operations = operations;
    });
    this.patientService.getPatientDischargeLabels().subscribe((data: any) => {
      this.dischargeLabels = data;
    });

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
          // Set some defaults
          this.patient = {
            patientId: patientId,
            patientDischargeLabelId: 1,
            patientUrgencyScale: 1
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
      this.patientService
        .getPatientByPatientId(this.patient.patientId)
        .pipe(take(1))
        .subscribe((data: Patient) => {
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
          this.createForm();
          // We need to explicitly set this value we learned from testing.
          this.patientForm
            .get('patient.dischargeInfo.patientDischargedTo')
            .setValue(this.patient.patientDischargeLabelId.toString());
          this.patientContacts$ = this.patientContactService.getPatientContactsByPatientId(this.patient.patientId);
          this.patientContacts$.subscribe((patientContacts: PatientContact[]) => {
            let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
            if (patientContacts) {
              this.patientContacts.splice(0, 1);
              patientContacts.forEach((patientContact: PatientContact, idx: number) => {
                patientContact.patientContactOrder = (idx + 1).toString();
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
                this.patientContactsOriginal.push(patientContact);
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
                let newFormGroup = this.fb.group({});
                this.patientIntakeQuestionService
                  .getPatientIntakeQuestionAnswersByPatientIntakeQuestionId(
                    patientIntakeQuestion.patientIntakeQuestionId
                  )
                  .subscribe((patientIntakeQuestionAnswer: PatientIntakeQuestionAnswer) => {
                    if (patientIntakeQuestionAnswer !== null) {
                      var data = patientIntakeQuestionAnswer[0];
                      var patientIntakeQuestionId = data.patientIntakeQuestionId.toString();
                      var patientIntakeQuestionAnswerValue = data.patientIntakeQuestionAnswer;
                      newFormGroup.addControl(
                        patientIntakeQuestionId,
                        new FormControl(patientIntakeQuestionAnswerValue)
                      );
                      patientIntakeQuestionAnswers.push(newFormGroup);
                      var dataObject = <any>{};
                      dataObject[patientIntakeQuestionId] = patientIntakeQuestionAnswerValue;
                      this.patientIntakeQuestionAnswersOriginal.push(dataObject);
                      this.patientIntakeQuestions.push(patientIntakeQuestion);
                    } else {
                      newFormGroup.addControl(
                        patientIntakeQuestion.patientIntakeQuestionId.toString(),
                        new FormControl('')
                      );
                      patientIntakeQuestionAnswers.push(newFormGroup);
                      this.patientIntakeQuestions.push(patientIntakeQuestion);
                    }
                  });
              });
            });
        });
    }
  }

  private createForm() {
    this.patientForm = this.fb.group({
      operation: this.fb.control(this.patient.patientOperationId, [Validators.required]),
      patient: this.fb.group({
        patientMedicalRecordNumber: this.fb.control(this.patient.patientMedicalRecordNumber, [
          Validators.required,
          Validators.pattern(this.stringMinimumOneWordRegEx)
        ]),
        patientName: this.fb.group({
          patientFirstName: this.fb.control(this.patient.patientFirstName, [
            Validators.required,
            Validators.pattern(this.stringMinimumOneWordRegEx)
          ]),
          patientMiddleName: this.fb.control(this.patient.patientMiddleName),
          patientLastName: this.fb.control(this.patient.patientLastName, [
            Validators.required,
            Validators.pattern(this.stringMinimumOneWordRegEx)
          ])
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
          patientDischargedTo: this.fb.control(this.patient.patientDischargeLabelId.toString(), [Validators.required]),
          patientDischargedAma: this.fb.control((this.patient.patientDischargedAma == true ? '1' : '0') || '0', [
            Validators.required
          ])
        }),
        patientMedicalConditions: this.fb.group({
          cardiacBoolean: this.fb.control(this.patient.patientMedicalConditions.cardiacBoolean == true ? 1 : 0),
          sepsisBoolean: this.fb.control(this.patient.patientMedicalConditions.sepsisBoolean == true ? 1 : 0),
          pulmonaryBoolean: this.fb.control(this.patient.patientMedicalConditions.pulmonaryBoolean == true ? 1 : 0),
          otherBoolean: this.fb.control(this.patient.patientMedicalConditions.otherBoolean == true ? 1 : 0)
        }),
        patientPrimaryDiagnosis: this.fb.control(this.patient.patientPrimaryDiagnosis, [
          Validators.required,
          Validators.pattern(this.stringMinimumOneWordRegEx)
        ]),
        patientDischargedCondition: this.fb.control(this.patient.patientDischargedCondition, [
          Validators.required,
          Validators.pattern(this.stringMinimumOneWordRegEx)
        ]),
        patientIntakeQuestionAnswers: this.fb.array([]),
        patientUrgencyScale: this.fb.control(
          this.patient.patientUrgencyScale !== null ? this.patient.patientUrgencyScale.toString() : null
        ),
        patientNeedToKnow: this.fb.control(this.patient.patientNeedToKnow),
        patientActive: this.fb.control(this.patient.patientActive)
      })
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
        patientContactFirstName: this.fb.control(''),
        patientContactLastName: this.fb.control(''),
        patientContactRelationship: this.fb.control(''),
        patientContactCountryCode: this.fb.control('1'),
        patientContactAreaCode: this.fb.control(''),
        patientContactPhoneNumber: this.fb.control(''),
        patientContactOrder: this.fb.control(idx + 1),
        patientContactResponsiblePartyBoolean: this.fb.control(false)
      })
    );
  }

  removeAdditionalPatientContact(idx: number) {
    let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
    patientContactArray.at(idx).clearValidators();
    patientContactArray.removeAt(idx);
    this.patientContactsToRemove.push(this.patientContacts[idx].patientContactId);
    this.patientContacts.splice(idx, 1);
    // Reset new contact order
    this.patientContacts.forEach((patientContact, idx) => {
      this.patientContacts[idx].patientContactOrder = (idx + 1).toString();
    });
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
  deletePatient(patientId: number): void {
    if (confirm('This will permanently delete the patient and their history. \
    Are you sure you want to do this?')) {
      this.patientService.deletePatientByPatientId(this.patient.patientId).subscribe(() => {
        this.toastrService.success('Patient Successfully Deleted');
        window.location.href = '/operations/' + this.patient.patientOperationId + '/patients';
      });
    }
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

    /**
     * Add answers if we don't have them yet, we do this by comparing the objects
     */

    if (this.patientIntakeQuestionAnswersOriginal.length) {
      this.patientIntakeQuestionAnswersToAdd = intakeAnswersArray.filter(
        (patientContactQuestionAnswer: any, index: number) => {
          return (
            Object.is(patientContactQuestionAnswer[index], this.patientIntakeQuestionAnswersOriginal[index]) &&
            patientContactQuestionAnswer[index] !== undefined
          );
        }
      );
    } else {
      this.patientIntakeQuestionAnswersToAdd = intakeAnswersArray;
    }

    this.patientIntakeQuestionAnswersToAdd.forEach((patientIntakeQuestionAnswer: PatientIntakeQuestionAnswer) => {
      var patientIntakeQuestionId = parseInt(Object.keys(patientIntakeQuestionAnswer).toString());
      var patientQuestionAnswer = patientIntakeQuestionAnswer[patientIntakeQuestionId];
      this.patientIntakeQuestionService
        .addPatientIntakeQuestionAnswerByPatientIntakeQuestionId(patientIntakeQuestionId, patientQuestionAnswer)
        .subscribe((data: any) => {});
    });
    /**
     * Edit questions if we already had them
     */
    intakeAnswersArray.forEach((patientIntakeQuestionAnswer: any) => {
      var patientIntakeQuestionId = parseInt(Object.keys(patientIntakeQuestionAnswer).toString());
      var patientQuestionAnswer = patientIntakeQuestionAnswer[patientIntakeQuestionId];
      this.patientIntakeQuestionService
        .editPatientIntakeQuestionAnswerByPatientIntakeQuestionId(patientIntakeQuestionId, patientQuestionAnswer)
        .subscribe((data: any) => {});
    });

    console.log(this.patientContacts);
    // Passing E2E
    this.patientContactsToRemove.forEach((patientContactId: number, index: number) => {
      this.patientContactService.removePatientContactByPatientContactId(patientContactId).subscribe(() => {
        this.toastrService.success('Successfully removed patient contact');
      });
    });
    // console.log(this.patientContactsToRemove);
    // debugger;
    /**
     * Get a diff from our original patient contacts
     */
    this.patientContactsToAdd = this.patientContacts.filter((patientContact: PatientContact) => {
      return this.patientContactsOriginal.indexOf(patientContact) == -1;
    });

    // console.log(this.patientContactsToAdd);
    // debugger;
    // Passing E2E
    this.patientContactsToAdd.forEach((patientContact: PatientContact, index: number) => {
      var indexToGrab = parseInt(patientContact.patientContactOrder) - 1;
      this.patientContacts[indexToGrab] = formSubmission.patient.patientContacts[indexToGrab];
      var patientContactPost = this.patientContactPostFactory(this.patientContacts[indexToGrab]);
      this.patientContactService
        .addNewPatientContactByPatientId(this.patient.patientId, patientContactPost)
        .subscribe(() => {
          this.toastrService.success('Successfully added patient contact');
        });
    });

    if (this.patientContacts.length) {
      this.patientContactsToEdit = this.patientContacts.filter((patientContact: any, index: number) => {
        if (!patientContact.patientContactId) {
          return false;
        }
        /**
         * Get the actual form submission value and then compare it to see if we need to edit
         */
        var indexToGrab = parseInt(patientContact.patientContactOrder) - 1;
        // Set patient contact id since we have no form control.
        formSubmission.patient.patientContacts[indexToGrab].patientContactId = patientContact.patientContactId;
        formSubmission.patient.patientContacts[indexToGrab].patientId = this.patient.patientId;
        this.patientContacts[indexToGrab] = formSubmission.patient.patientContacts[indexToGrab];
        console.log(patientContact);
        console.log(this.patientContacts[indexToGrab]);
        // Use lodash to see if these are deep-equal
        return !_.isEqual(patientContact, this.patientContacts[indexToGrab]);
      });
      if (!this.patientContactsToEdit.length) {
        this.editPatient(formSubmission);
      }
      // console.log(this.patientContactsToEdit.length);
      // debugger;
      this.patientContactsToEdit.forEach((patientContact: PatientContact, index: number) => {
        // Now that we have these, we need to reassign to the form-submitted value.
        var indexToGrab = parseInt(patientContact.patientContactOrder) - 1;
        this.patientContacts[indexToGrab] = formSubmission.patient.patientContacts[indexToGrab];
        var patientContactPut = this.patientContactPutFactory(this.patientContacts[indexToGrab]);
        // console.log(patientContactPut);
        // debugger;
        this.patientContactService
          .editPatientContactByPatientId(this.patientContacts[indexToGrab].patientContactId, patientContactPut)
          .subscribe(() => {
            this.toastrService.success('Successfully edited patient contact');
            /**
             * Now go ahead and save other patient details
             */
            this.editPatient(formSubmission);
          });
      });
    } else {
      this.editPatient(formSubmission);
    }
  }
  editPatient(formSubmission: any) {
    let patientPutBody = this.formSubmissionFactory(formSubmission);
    // console.log(patientPutBody);
    // debugger;
    this.patientService.editPatientByPatientId(this.patient.patientId, patientPutBody).subscribe(value => {
      this.toastrService.success('Successfully edited patient!');
      window.location.href = '/operations/' + this.patientForm.get('operation').value + '/patients';
      if (!this.editMode) {
        this.patientForm.reset();
      }
    });
  }
  patientContactPutFactory(patientContact: PatientContact): PatientContactPutBody {
    try {
      var payload = {
        patientContactId: patientContact.patientContactId,
        patientContactFirstName: patientContact.patientContactFirstName.toString(),
        patientContactLastName: patientContact.patientContactLastName.toString(),
        patientContactRelationship: patientContact.patientContactRelationship.toString(),
        patientContactCountryCode: patientContact.patientContactCountryCode.toString(),
        patientContactAreaCode: patientContact.patientContactAreaCode.toString(),
        patientContactPhoneNumber: patientContact.patientContactPhoneNumber.toString(),
        patientContactOrder: parseInt(patientContact.patientContactOrder),
        patientContactResponsiblePartyBoolean: patientContact.patientContactResponsiblePartyBoolean == true ? 1 : 0
      };
      return <PatientContactPutBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  patientContactPostFactory(patientContact: PatientContact): PatientContactPostBody {
    try {
      var payload = {
        patientId: this.patient.patientId,
        patientContactFirstName: patientContact.patientContactFirstName.toString(),
        patientContactLastName: patientContact.patientContactLastName.toString(),
        patientContactRelationship: patientContact.patientContactRelationship.toString(),
        patientContactCountryCode: patientContact.patientContactCountryCode.toString(),
        patientContactAreaCode: patientContact.patientContactAreaCode.toString(),
        patientContactPhoneNumber: patientContact.patientContactPhoneNumber.toString(),
        patientContactOrder: parseInt(patientContact.patientContactOrder),
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
    /**
     * Do transforms so we have proper UTC times on the dates
     */
    var patientDob = formSubmission.patient.patientDob.substr(0, 10) + 'T12:00:00.00Z';
    var patientAdmitDate = formSubmission.patient.dischargeInfo.patientAdmitDate.substr(0, 10) + 'T12:00:00.00Z';
    var patientDischargeDate =
      formSubmission.patient.dischargeInfo.patientDischargeDate.substr(0, 10) + 'T12:00:00.00Z';

    const patientMedicalConditions = JSON.stringify(formSubmission.patient.patientMedicalConditions);
    var payload = {
      patientDob: patientDob,
      patientOperationId: formSubmission.operation,
      patientMedicalRecordNumber: formSubmission.patient.patientMedicalRecordNumber,
      patientFirstName: formSubmission.patient.patientName.patientFirstName,
      patientMiddleName: formSubmission.patient.patientName.patientMiddleName || '',
      patientLastName: formSubmission.patient.patientName.patientLastName,
      patientPrimaryInsurance: formSubmission.patient.insurance.primaryInsurance || '',
      patientSecondaryInsurance: formSubmission.patient.insurance.secondaryInsurance || '',
      patientAdmitDate: patientAdmitDate,
      patientDischargeDate: patientDischargeDate,
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
    const firstError = <HTMLElement>document.querySelectorAll('ion-item .ng-invalid')[0];

    function scroll(el: HTMLElement) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    if (firstError) {
      scroll(firstError);
      return false;
    } else {
      return true;
    }
  }
  ngOnDestroy() {
    this.patient = null;
  }
}
