import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { map } from 'rxjs/operators';
import { PatientPutBody } from './patient-form';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { PatientContact } from '../patient-contact/patient-contact';
import { OperationService } from '@app/modules/operation/operation.service';
import { PatientContactService } from '../patient-contact/patient-contact.service';
import { Operation } from '@app/modules/operation/operation';
import { PatientIntakeQuestion } from '../patient-intake-question/patient-intake-question.component';
import { PatientIntakeQuestionService } from '../patient-question/patient-intake-question.service';

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
  patientContacts: PatientContact[] = [];
  patientContacts$: Observable<PatientContact[]>;
  patientIntakeQuestions: PatientIntakeQuestion[] = [];
  patientIntakeQuestions$: Observable<PatientIntakeQuestion[]>;
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
              let patientIntakeQuestionId = patientIntakeQuestion['patientIntakeQuestionId'];
              // let newFormGroup = this.fb.group({});
              // newFormGroup.addControl(patientIntakeQuestionId.toString(), new FormControl(''));
              patientIntakeQuestionAnswers.push(this.fb.control({}));

              this.patientIntakeQuestions.push(patientIntakeQuestion);
            });
          });
      });
    } else {
      this.patientService.getPatientByPatientId(this.patient.patientId).subscribe((data: Patient) => {
        this.patient = data[0];
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
            debugger;
            patientIntakeQuestions.forEach((patientIntakeQuestion: PatientIntakeQuestion, index: number) => {
              patientIntakeQuestionAnswers.push(this.fb.control(index));
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
        patientUrgencyScale: this.fb.control(this.patient.patientUrgencyScale),
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
        alert('upload successful');
        // refine
        location.reload();
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
    let intakeAnswersObj = intakeAnswers.getRawValue();
    console.log(intakeAnswersObj);
    debugger;
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
    const patientDiagnosis = JSON.stringify(formSubmission.patient.patientDiagnosis);
    var payload = {
      patientDob: formSubmission.patient.patientDob,
      patientOperationId: formSubmission.operation,
      patientMedicalRecordNumber: formSubmission.patient.medicalRecordNumber,
      patientFirstName: formSubmission.patient.patientFirstName,
      patientMiddleName: formSubmission.patient.patientMiddleName,
      patientLastName: formSubmission.patient.patientLastName,
      patientPhysicianFirstName: formSubmission.patient.physicianInfo.physicianFirstName,
      patientPhysicianLastName: formSubmission.patient.physicianInfo.physicianLastName,
      patientPhysicianCountryCode: formSubmission.patient.physicianInfo.physicianCountryCode,
      patientPhysicianAreaCode: formSubmission.patient.physicianInfo.physicianAreaCode,
      patientPhysicianPhoneNumber: formSubmission.patient.physicianInfo.physicianPhoneNumber,
      patientPrimaryInsurance: formSubmission.patient.insurance.primaryInsurance,
      patientSecondaryInsurance: formSubmission.patient.insurance.secondaryInsurance,
      patientAdmitDate: formSubmission.patient.dischargeInfo.patientAdmitDate,
      patientDischargeDate: formSubmission.patient.dischargeInfo.patientDischargeDate,
      patientDischargedAma: formSubmission.patient.dischargeInfo.patientDischargedAma,
      patientDischargeLocationLabelId: formSubmission.patient.dischargeInfo.patientDischargedTo,
      patientPrimaryDiagnosis: formSubmission.patient.patientMedicalConditions.primaryDiagnosis,
      patientDiagnosis: patientDiagnosis,
      patientUrgencyScale: formSubmission.patient.patientUrgencyScale,
      patientNeedToKnow: formSubmission.patient.patientNeedToKnow,
      patientActive: formSubmission.patient.patientActive
    };
    return <PatientPutBody>payload;
  }
}
