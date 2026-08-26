import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { Patient, PatientDischargeLabel } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import {
  AbstractControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { PatientPutBody } from './patient-form';
import { PatientContact, PatientContactPostBody, PatientContactPutBody } from '../patient-contact/patient-contact';
import { PatientContactService } from '../patient-contact/patient-contact.service';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import {
  PatientIntakeQuestion,
  PatientIntakeQuestionAnswer
} from '../patient-intake-question/patient-intake-question.component';
import { PatientIntakeQuestionService } from '../patient-intake-question/patient-intake-question.service';
import { SafeStyle } from '@angular/platform-browser';
import { finalize, switchMap, take, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ModalController } from '@ionic/angular';

import { NgxImageCompressService } from 'ngx-image-compress';
import { formatDate } from '@angular/common';
import { UserService } from '@app/modules/user/user.service';
import {
  SearchableSelectModalComponent,
  SearchableSelectModalGroup
} from '@app/shared/searchable-select-modal/searchable-select-modal.component';

interface FacilityOperationGroup {
  key: string;
  label: string;
  operations: Operation[];
}

type DischargeDateControlName = 'patientAdmitDate' | 'patientDischargeDate';

@Component({
  providers: [NgxImageCompressService, PatientService, PatientIntakeQuestionService],
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
  standalone: false
})
export class PatientFormComponent implements OnInit {
  avatarExists: Boolean;
  public avatarUrl: SafeStyle;
  dischargeLabels: PatientDischargeLabel[];
  dischargedTo: string = 'Home';
  patientForm: FormGroup;
  currentYear: number;
  mode: any = {
    add: null,
    edit: null
  };
  patient: Patient;
  patient$: Observable<Patient> | void;
  patientContacts: PatientContact[] = [];
  patientContactsOriginal: PatientContact[] = [];
  patientContactsToAdd: PatientContact[] = [];
  patientContactsToEdit: PatientContact[] = [];
  patientContactsToRemove: string[] = [];
  patientContacts$: Observable<PatientContact[]>;
  patientContactRelationships = ['Spouse', 'Child', 'Parent', 'Relative', 'Friend', 'Sig. Other', 'Other'];
  patientIntakeQuestions: PatientIntakeQuestion[] = [];
  patientIntakeQuestions$: Observable<PatientIntakeQuestion[]>;
  patientIntakeQuestionAnswersOriginal: {
    patientIntakeQuestionId: string;
    patientIntakeQuestionAnswer: string;
  }[] = [];
  patientIntakeQuestionAnswers: PatientIntakeQuestionAnswer[] = [];
  patientIntakeQuestionAnswersToAdd: PatientIntakeQuestionAnswer[] = [];
  activeDischargeDateControl: DischargeDateControlName | null = null;
  activeDischargeDateValue: string | null = null;
  isPatientDobPickerOpen: boolean = false;
  activePatientDobValue: string | null = null;
  patientDobDisplayValue: string = '';
  dischargeDateDisplayValues: Record<DischargeDateControlName, string> = {
    patientAdmitDate: '',
    patientDischargeDate: ''
  };
  patientMaxAdmitDate: string = '';
  patientMinDischargeDate: string = '';
  readonly patientDobMax: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  readonly dischargeDateFormatOptions = {
    date: {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }
  } as const;
  patientMedicalConditions?: string;
  isSaving: boolean = false;
  operations: Operation[];
  groupedOperations: FacilityOperationGroup[] = [];
  operations$: Observable<Operation[]>;
  stringMinimumOneWordRegEx = RegExp(/^(?!\s*$).+/);
  private readonly phoneNumberRegEx = RegExp(/^[0-9-]{7,}$/);
  private readonly facilityLabelOverrides: Record<string, string> = {
    'MONUMENT SOUTH SALT LAKE': 'Salt Lake'
  };

  user: User;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private patientContactService: PatientContactService,
    private patientIntakeQuestionService: PatientIntakeQuestionService,
    private toastrService: ToastrService,
    private userService: UserService,
    private modalController?: ModalController
  ) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.user = this.route.snapshot.data.user;

    if (this.route.snapshot.data.mode == 'edit') {
      this.mode.edit = true;
      this.patient = this.route.snapshot.data.patient;
    } else if (this.route.snapshot.data.mode == 'add') {
      this.mode.add = true;
    }

    this.operations = this.getVisibleOperations(
      Array.isArray(this.user?.operations) ? this.user.operations : [],
      this.user?.operationGroups,
      this.route.snapshot.data.patient?.patientOperationId || this.patient?.patientOperationId
    );
    this.groupedOperations = this.buildGroupedOperations(this.operations, this.user?.operationGroups);

    this.patientService.getPatientDischargeLabels().subscribe((data: any) => {
      this.dischargeLabels = data;
      this.dischargedTo = data;
    });

    if (this.mode.add) {
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
            patientDischargeLabelId: null
          };
        }
        this.patient.patientMedicalConditions = {
          cardiacBoolean: false,
          sepsisBoolean: false,
          pulmonaryBoolean: false,
          otherBoolean: false
        };
        this.createForm();
        this.patientForm.get('patient.dischargeInfo.patientDischargedTo').setValue('2PEXyKgz');
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
        .subscribe((data: Patient | Patient[]) => {
          const patientRecord = Array.isArray(data) ? data[0] : data;
          if (!patientRecord) {
            return;
          }
          this.patient = patientRecord;
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
            .setValue(this.patient.patientDischargeLabelId ? this.patient.patientDischargeLabelId : '2PEXyKgz');
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
                    patientContactCountryCode: this.fb.control(patientContact.patientContactCountryCode, [
                      Validators.pattern(/^[0-9]\d*$/)
                    ]),
                    patientContactAreaCode: this.fb.control(patientContact.patientContactAreaCode, [
                      Validators.pattern(/^[0-9]\d*$/)
                    ]),
                    patientContactPhoneNumber: this.fb.control(patientContact.patientContactPhoneNumber, [
                      Validators.pattern(/^[0-9-]{7,}\d*$/)
                    ]),
                    patientContactOrder: this.fb.control(patientContact.patientContactOrder, [
                      Validators.pattern(/^[0-9]\d*$/)
                    ]),
                    patientContactHIPAABoolean: this.fb.control(
                      this.normalizeContactResponsiblePartyBoolean(patientContact)
                    ),
                    patientContactResponsiblePartyBoolean: this.fb.control(
                      this.normalizeContactResponsiblePartyBoolean(patientContact)
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
                  .subscribe(
                    (patientIntakeQuestionAnswer: PatientIntakeQuestionAnswer | PatientIntakeQuestionAnswer[]) => {
                      const answerRecord: any = Array.isArray(patientIntakeQuestionAnswer)
                        ? patientIntakeQuestionAnswer[0]
                        : patientIntakeQuestionAnswer;
                      if (answerRecord) {
                        const patientIntakeQuestionId = answerRecord.patientIntakeQuestionId.toString();
                        const patientIntakeQuestionAnswerValue = answerRecord.patientIntakeQuestionAnswer;
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
                    }
                  );
              });
            });
        });
    }
  }

  private getVisibleOperations(
    operations: Operation[],
    operationGroups: OperationGroup[],
    selectedOperationId?: string
  ): Operation[] {
    const activeOperationGroupIds = new Set(
      (Array.isArray(operationGroups) ? operationGroups : [])
        .filter((operationGroup: OperationGroup) => Number(operationGroup?.operationGroupActive) !== 0)
        .map((operationGroup: OperationGroup) => String(operationGroup?.operationGroupId))
    );

    return (Array.isArray(operations) ? operations : []).filter((operation: Operation) => {
      if (!operation?.operationId) {
        return false;
      }

      if (selectedOperationId && operation.operationId === selectedOperationId) {
        return true;
      }

      if (Number(operation?.operationActive) === 0) {
        return false;
      }

      if (!operation?.operationGroupId || !activeOperationGroupIds.size) {
        return true;
      }

      return activeOperationGroupIds.has(String(operation.operationGroupId));
    });
  }

  private buildGroupedOperations(
    operations: Operation[],
    operationGroups: OperationGroup[]
  ): FacilityOperationGroup[] {
    const safeOperations = Array.isArray(operations) ? operations : [];
    const safeOperationGroups = Array.isArray(operationGroups) ? operationGroups : [];
    const groupedOperations: FacilityOperationGroup[] = [];
    const seenOperationIds = new Set<string>();

    safeOperationGroups.forEach((operationGroup: OperationGroup) => {
      const operationsForGroup = safeOperations.filter((operation: Operation) => {
        return operation.operationGroupId == operationGroup.operationGroupId;
      });

      if (!operationsForGroup.length) {
        return;
      }

      operationsForGroup.forEach((operation: Operation) => {
        if (operation?.operationId) {
          seenOperationIds.add(operation.operationId);
        }
      });

      groupedOperations.push({
        key: String(operationGroup.operationGroupId || operationGroup.operationGroupName || groupedOperations.length),
        label: operationGroup.operationGroupName || operationGroup.operationGroupShortName || 'Client',
        operations: operationsForGroup
      });
    });

    const fallbackGroupMap = new Map<string, FacilityOperationGroup>();

    safeOperations.forEach((operation: Operation) => {
      if (operation?.operationId && seenOperationIds.has(operation.operationId)) {
        return;
      }

      const fallbackKey = String(
        operation?.operationGroupId || operation?.operationGroupName || operation?.operationGroupShortName || 'other'
      );
      const fallbackLabel = operation?.operationGroupName || operation?.operationGroupShortName || 'Other Clients';

      if (!fallbackGroupMap.has(fallbackKey)) {
        fallbackGroupMap.set(fallbackKey, {
          key: fallbackKey,
          label: fallbackLabel,
          operations: []
        });
      }

      fallbackGroupMap.get(fallbackKey).operations.push(operation);
    });

    return groupedOperations.concat(Array.from(fallbackGroupMap.values()));
  }

  get selectedOperationName(): string {
    const selectedOperationId = this.patientForm?.get('patient.operation')?.value || this.patient?.patientOperationId;
    const selectedOperation = this.operations?.find((operation: Operation) => operation.operationId == selectedOperationId);

    return this.formatFacilityLabel(selectedOperation?.operationName || '');
  }

  async openFacilitySelectModal(): Promise<void> {
    if (!this.modalController) {
      return;
    }

    const modal = await this.modalController.create({
      component: SearchableSelectModalComponent,
      cssClass: 'searchable-select-modal',
      componentProps: {
        title: 'Select Facility',
        groups: this.buildFacilitySelectGroups(),
        selectedValue: this.patientForm?.get('patient.operation')?.value || this.patient?.patientOperationId || null,
        placeholder: 'Search facilities'
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'confirm' || !data) {
      return;
    }

    this.applyFacilitySelectionByValue(data.value);
  }

  private applyFacilitySelectionByValue(operationId: string | number): void {
    if (!operationId || !this.patientForm) {
      return;
    }

    const selectedOperation = this.operations?.find((operation: Operation) => operation.operationId == operationId);

    if (!selectedOperation?.operationId) {
      return;
    }

    const operationControl = this.patientForm.get('patient.operation');
    const existingValue = operationControl?.value;

    operationControl?.setValue(selectedOperation.operationId);
    operationControl?.markAsDirty();
    operationControl?.markAsTouched();

    if (existingValue == selectedOperation.operationId) {
      operationControl?.markAsPristine();
    }

    if (this.patient) {
      this.patient.patientOperationId = selectedOperation.operationId as any;
    }
  }

  private buildFacilitySelectGroups(): SearchableSelectModalGroup[] {
    return this.groupedOperations
      .map((operationGroup: FacilityOperationGroup) => ({
        key: operationGroup.key,
        label: this.formatFacilityLabel(operationGroup.label),
        items: operationGroup.operations.map((operation: Operation) => ({
          label: this.formatFacilityOptionLabel(operation),
          value: operation.operationId,
          searchText: [
            operation?.operationName,
            this.formatFacilityLabel(operation?.operationName || ''),
            operationGroup.label,
            this.formatFacilityLabel(operationGroup.label || ''),
            operation?.operationGroupName
          ]
            .filter(Boolean)
            .join(' ')
        }))
      }))
      .filter((operationGroup: SearchableSelectModalGroup) => operationGroup.items.length > 0);
  }

  private formatFacilityOptionLabel(operation: Operation): string {
    return this.formatFacilityLabel(operation?.operationName || '');
  }

  private formatFacilityLabel(value: string): string {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
      return '';
    }

    const formattedValue = /[a-z]/.test(normalizedValue)
      ? normalizedValue
      : normalizedValue
          .split(/(\s+|-|\/)/)
          .map((segment: string) => this.formatFacilitySegment(segment))
          .join('');

    const overriddenValue = this.facilityLabelOverrides[formattedValue.toUpperCase()] || formattedValue;

    return overriddenValue.replace(/\bOf\b/g, 'of');
  }

  private formatFacilitySegment(segment: string): string {
    if (!segment || /^\s+$/.test(segment) || segment === '-' || segment === '/') {
      return segment;
    }

    if (/^[A-Z0-9&]{1,3}$/.test(segment)) {
      return segment;
    }

    const loweredSegment = segment.toLowerCase();

    return loweredSegment.charAt(0).toUpperCase() + loweredSegment.slice(1);
  }

  private createForm() {
    this.patientForm = this.fb.group({
      patient: this.fb.group({
        operation: this.fb.control(this.patient.patientOperationId, [Validators.required]),
        patientMedicalRecordNumber: this.fb.control(this.patient.patientMedicalRecordNumber, [
          Validators.required,
          Validators.pattern(this.stringMinimumOneWordRegEx)
        ]),
        patientName: this.fb.group({
          patientFirstName: this.fb.control(this.patient.patientFirstName, [
            Validators.required,
            Validators.pattern(this.stringMinimumOneWordRegEx)
          ]),
          patientLastName: this.fb.control(this.patient.patientLastName, [
            Validators.required,
            Validators.pattern(this.stringMinimumOneWordRegEx)
          ])
        }),
        patientDob: this.fb.control(
          this.patient.patientDob ? formatDate(this.patient.patientDob, 'yyyy-MM-dd', 'en') : '',
          [Validators.required]
        ),
        patientGender: this.fb.control(this.patient.patientGender),
        patientCountryCode: this.fb.control(
          this.patient.patientCountryCode ? this.patient.patientCountryCode.toString() : '1'
        ),
        patientAreaCode: this.fb.control(this.patient.patientAreaCode),
        patientPhoneNumber: this.fb.control(this.formatPhoneInputValue(this.patient.patientPhoneNumber), [
          Validators.pattern(this.phoneNumberRegEx)
        ]),
        patientIsResponsibleParty: this.fb.control(this.normalizePatientResponsiblePartyBoolean(this.patient)),
        patientSpeaksEnglish: this.fb.control(
          typeof this.patient.patientSpeaksEnglish == 'undefined' || this.patient.patientSpeaksEnglish == true
            ? false
            : true
        ),
        patientFluentLanguage: this.fb.control(
          this.patient.patientFluentLanguage ? this.patient.patientFluentLanguage : ''
        ),
        patientContacts: this.fb.array([]),
        hospitalAdmitted: this.fb.group({
          patientHospitalAdmitted: this.fb.control(
            this.patient.patientHospitalAdmitted || this.patient.patientPrimaryInsurance || ''
          )
        }),
        dischargeInfo: this.fb.group({
          patientAdmitDate: this.fb.control(
            this.patient.patientAdmitDate ? formatDate(this.patient.patientAdmitDate, 'yyyy-MM-dd', 'en') : '',
            [Validators.required]
          ),
          patientDischargeDate: this.fb.control(
            this.patient.patientDischargeDate
              ? formatDate(this.patient.patientDischargeDate, 'yyyy-MM-dd', 'en')
              : null,
            [Validators.required]
          ),
          patientTotalDays: this.fb.control({
            disabled: true,
            value: this.patient.patientTotalDays
          }),
          patientDischargedTo: this.fb.control(
            this.patient.patientDischargeLabelId ? this.patient.patientDischargeLabelId : '2PEXyKgz',
            [Validators.required]
          ),
          patientDischargedAma: this.fb.control(this.patient.patientDischargedAma == true ? '1' : '0', [
            Validators.required
          ])
        }, { validators: this.dischargeDateOrderValidator }),
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
        patientDischargedCondition: this.fb.control(this.patient.patientDischargedCondition),
        patientIntakeQuestionAnswers: this.fb.array([]),
        patientNeedToKnow: this.fb.control(this.patient.patientNeedToKnow),
        patientActive: this.fb.control(this.patient.patientActive)
      })
    });

    this.syncLanguageControls();
    this.updateDischargeFields();
    this.syncPatientDobDisplayValue();
    this.syncDischargeDateDisplayValue('patientAdmitDate');
    this.syncDischargeDateDisplayValue('patientDischargeDate');
  }

  onPatientLanguageToggle() {
    this.syncLanguageControls();
  }

  clearPatientFluentLanguage() {
    const patientSpeaksEnglishControl = this.patientForm.get('patient.patientSpeaksEnglish');
    const patientFluentLanguageControl = this.patientForm.get('patient.patientFluentLanguage');

    if (!patientSpeaksEnglishControl || !patientFluentLanguageControl) {
      return;
    }

    patientSpeaksEnglishControl.setValue(false);
    patientFluentLanguageControl.setValue('');
    this.syncLanguageControls();
  }

  private syncLanguageControls() {
    const patientSpeaksEnglishControl = this.patientForm.get('patient.patientSpeaksEnglish');
    const patientFluentLanguageControl = this.patientForm.get('patient.patientFluentLanguage');

    if (!patientSpeaksEnglishControl || !patientFluentLanguageControl) {
      return;
    }

    const doesNotSpeakEnglish = patientSpeaksEnglishControl.value === true;

    if (doesNotSpeakEnglish) {
      patientFluentLanguageControl.setValidators([Validators.pattern(this.stringMinimumOneWordRegEx)]);
    } else {
      patientFluentLanguageControl.clearValidators();
      patientFluentLanguageControl.setValue('');
    }

    patientFluentLanguageControl.updateValueAndValidity({ emitEvent: false });
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
      patientContactHIPAABoolean: false,
      patientContactResponsiblePartyBoolean: false
    });
    let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
    let idx = patientContactArray.length;
    patientContactArray.push(
      this.fb.group({
        patientContactFirstName: this.fb.control(''),
        patientContactLastName: this.fb.control(''),
        patientContactRelationship: this.fb.control(''),
        patientContactCountryCode: this.fb.control(1, Validators.pattern(/^[0-9]\d*$/)),
        patientContactAreaCode: this.fb.control('', Validators.pattern(/^[0-9]\d*$/)),
        patientContactPhoneNumber: this.fb.control(''),
        patientContactOrder: this.fb.control(idx + 1),
        patientContactHIPAABoolean: this.fb.control(false),
        patientContactResponsiblePartyBoolean: this.fb.control(false)
      })
    );

    this.syncPatientContactOrders(patientContactArray);
  }

  syncContactFlags(idx: number) {
    const patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
    const contactGroup = patientContactArray.at(idx);

    if (!contactGroup) {
      return;
    }

    const isResponsibleParty = contactGroup.get('patientContactResponsiblePartyBoolean').value === true;
    contactGroup.get('patientContactHIPAABoolean').setValue(isResponsibleParty);
  }

  onPatientDobInput(inputValue: string) {
    this.patientDobDisplayValue = inputValue || '';
    this.syncTypedDateControl('patient.patientDob', this.patientDobDisplayValue);
  }

  onPatientDobInputBlur() {
    const control = this.patientForm.get('patient.patientDob');

    if (!control) {
      return;
    }

    const typedValue = (this.patientDobDisplayValue || '').trim();

    if (!typedValue) {
      control.setValue('');
      control.markAsDirty();
      control.markAsTouched();
      this.patientDobDisplayValue = '';
      return;
    }

    const normalized = this.normalizeDischargeDateValue(typedValue);

    if (this.isNormalizedDischargeDateValue(normalized)) {
      control.setValue(normalized);
      control.markAsDirty();
      control.markAsTouched();
      this.syncPatientDobDisplayValue();

      if (this.isPatientDobPickerOpen) {
        this.activePatientDobValue = normalized;
      }
    } else {
      control.setValue('');
      control.markAsDirty();
      control.markAsTouched();
    }
  }

  openPatientDobPicker() {
    if (this.isPatientDobPickerOpen) {
      this.closePatientDobPicker();
      return;
    }

    this.closeDischargeDatePicker();
    this.isPatientDobPickerOpen = true;
    this.activePatientDobValue = this.getPatientDobControlValue() || null;
  }

  closePatientDobPicker() {
    this.isPatientDobPickerOpen = false;
    this.activePatientDobValue = null;
  }

  onPatientDobPickerChange(event: CustomEvent<{ value?: string | null }>) {
    const control = this.patientForm.get('patient.patientDob');

    if (!control) {
      this.closePatientDobPicker();
      return;
    }

    const normalized = this.normalizeDischargeDateValue(event.detail?.value || '');
    control.setValue(normalized || '');
    control.markAsDirty();
    control.markAsTouched();
    this.syncPatientDobDisplayValue();
    this.closePatientDobPicker();
  }

  getPatientDobDisplayValue(): string {
    return this.patientDobDisplayValue || '';
  }

  getPatientDobPickerMax(): string | undefined {
    return this.patientDobMax || undefined;
  }

  onDischargeDateBlur(controlName: 'patientAdmitDate' | 'patientDischargeDate') {
    const control = this.patientForm.get('patient.dischargeInfo.' + controlName);

    if (!control) {
      return;
    }

    const normalized = this.normalizeDischargeDateValue(control.value);
    if (normalized && normalized !== control.value) {
      control.setValue(normalized);
    }

    this.syncDischargeDateDisplayValue(controlName);
    this.updateDischargeFields();
  }

  onDischargeDateInput(controlName: DischargeDateControlName, inputValue: string) {
    this.dischargeDateDisplayValues[controlName] = inputValue || '';
    this.syncTypedDateControl('patient.dischargeInfo.' + controlName, this.dischargeDateDisplayValues[controlName]);
    this.updateDischargeFields();
  }

  onDischargeDateInputBlur(controlName: DischargeDateControlName) {
    const control = this.patientForm.get('patient.dischargeInfo.' + controlName);

    if (!control) {
      return;
    }

    const typedValue = (this.dischargeDateDisplayValues[controlName] || '').trim();

    if (!typedValue) {
      control.setValue('');
      control.markAsDirty();
      control.markAsTouched();
      this.dischargeDateDisplayValues[controlName] = '';
      this.updateDischargeFields();
      return;
    }

    const normalized = this.normalizeDischargeDateValue(typedValue);

    if (this.isNormalizedDischargeDateValue(normalized)) {
      control.setValue(normalized);
      control.markAsDirty();
      control.markAsTouched();
      this.syncDischargeDateDisplayValue(controlName);

      if (this.activeDischargeDateControl === controlName) {
        this.activeDischargeDateValue = normalized;
      }
    } else {
      control.setValue('');
      control.markAsDirty();
      control.markAsTouched();
    }

    this.updateDischargeFields();
  }

  openDischargeDatePicker(controlName: DischargeDateControlName) {
    if (this.activeDischargeDateControl === controlName) {
      this.closeDischargeDatePicker();
      return;
    }

    this.closePatientDobPicker();
    this.activeDischargeDateControl = controlName;
    this.activeDischargeDateValue = this.getDischargeDateControlValue(controlName) || null;
  }

  closeDischargeDatePicker() {
    this.activeDischargeDateControl = null;
    this.activeDischargeDateValue = null;
  }

  onDischargeDatePickerChange(event: CustomEvent<{ value?: string | null }>) {
    if (!this.activeDischargeDateControl) {
      this.closeDischargeDatePicker();
      return;
    }

    const controlName = this.activeDischargeDateControl;
    const control = this.patientForm.get('patient.dischargeInfo.' + controlName);

    if (!control) {
      this.closeDischargeDatePicker();
      return;
    }

    const normalized = this.normalizeDischargeDateValue(event.detail?.value || '');
    control.setValue(normalized || '');
    control.markAsDirty();
    control.markAsTouched();
    this.syncDischargeDateDisplayValue(controlName);
    this.updateDischargeFields();
    this.closeDischargeDatePicker();
  }

  getDischargeDateDisplayValue(controlName: DischargeDateControlName): string {
    return this.dischargeDateDisplayValues[controlName] || '';
  }

  private syncPatientDobDisplayValue() {
    const value = this.getPatientDobControlValue();
    this.patientDobDisplayValue = this.formatDischargeDateDisplayValue(value);
  }

  private syncDischargeDateDisplayValue(controlName: DischargeDateControlName) {
    const value = this.getDischargeDateControlValue(controlName);
    this.dischargeDateDisplayValues[controlName] = this.formatDischargeDateDisplayValue(value);
  }

  private formatDischargeDateDisplayValue(value: string): string {
    if (!this.isNormalizedDischargeDateValue(value)) {
      return value || '';
    }

    const dateParts = value.split('-');
    return dateParts[1] + '/' + dateParts[2] + '/' + dateParts[0];
  }

  getActiveDischargeDateTitle(): string {
    return this.activeDischargeDateControl === 'patientAdmitDate' ? 'Select admit date' : 'Select discharge date';
  }

  getActiveDischargeDateMin(): string | undefined {
    return this.activeDischargeDateControl === 'patientDischargeDate' && this.patientMinDischargeDate
      ? this.patientMinDischargeDate
      : undefined;
  }

  getActiveDischargeDateMax(): string | undefined {
    return this.activeDischargeDateControl === 'patientAdmitDate' && this.patientMaxAdmitDate
      ? this.patientMaxAdmitDate
      : undefined;
  }

  removeAdditionalPatientContact(idx: number) {
    let patientContactArray = this.patientForm.get('patient.patientContacts') as FormArray;
    const patientContact = this.patientContacts[idx];

    if (!patientContactArray || !patientContactArray.at(idx) || !patientContact) {
      return;
    }

    patientContactArray.at(idx).clearValidators();
    patientContactArray.removeAt(idx);

    if (patientContact.patientContactId) {
      this.patientContactsToRemove.push(patientContact.patientContactId);
    }

    this.patientContacts.splice(idx, 1);
    this.syncPatientContactOrders(patientContactArray);
  }

  private syncPatientContactOrders(patientContactArray: FormArray) {
    this.patientContacts.forEach((patientContact, index) => {
      const nextOrder = (index + 1).toString();
      patientContact.patientContactOrder = nextOrder;

      const contactGroup = patientContactArray.at(index);
      if (contactGroup && contactGroup.get('patientContactOrder')) {
        contactGroup.get('patientContactOrder').setValue(index + 1, { emitEvent: false });
      }
    });
  }

  selectPatientContactRelationship(relationship: string, patientContact: PatientContact) {
    patientContact.patientContactRelationship = relationship;
  }
  updateDischargeFields() {
    let startDate = this.normalizeDischargeDateValue(
      this.patientForm.get('patient.dischargeInfo.patientAdmitDate').value
    );
    let endDate = this.normalizeDischargeDateValue(
      this.patientForm.get('patient.dischargeInfo.patientDischargeDate').value
    );
    if (!startDate || !endDate) {
      if (startDate) {
        this.patientMinDischargeDate = startDate.substr(0, 10);
        this.patientMaxAdmitDate = '';
      } else if (endDate) {
        this.patientMaxAdmitDate = endDate.substr(0, 10);
        this.patientMinDischargeDate = '';
      } else {
        this.patientMaxAdmitDate = '';
        this.patientMinDischargeDate = '';
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
        this.userService.updateOperations(this.user).then(res => {
          this.navigateTo('/operations/' + this.patient.patientOperationId + '/patients');
        });
      });
    }
  }
  cancel(): void {
    this.reloadPage();
  }
  onFormSubmit(): void {
    if (this.isSaving || !this.validateControls()) {
      return;
    }
    this.isSaving = true;
    const formSubmission = this.patientForm.getRawValue();
    const prerequisiteRequests = this.buildPatientPrerequisiteSaveRequests(formSubmission);
    const prerequisites = prerequisiteRequests.length ? forkJoin(prerequisiteRequests) : of([]);

    prerequisites
      .pipe(
        switchMap(() => this.getPatientSaveRequest(formSubmission)),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => this.handlePatientSaveSuccess(),
        error: () => this.handlePatientSaveError()
      });
  }

  private buildPatientPrerequisiteSaveRequests(formSubmission: any): Observable<any>[] {
    const requests: Observable<any>[] = [];
    const intakeAnswers = this.patientForm.controls.patient.get('patientIntakeQuestionAnswers') as FormArray;
    const intakeAnswersArray = intakeAnswers.getRawValue();

    this.patientIntakeQuestionAnswersToAdd = this.patientIntakeQuestionAnswersOriginal.length
      ? intakeAnswersArray.filter((answer: any, index: number) => !this.patientIntakeQuestionAnswersOriginal[index])
      : intakeAnswersArray;

    this.patientIntakeQuestionAnswersToAdd.forEach((answer: PatientIntakeQuestionAnswer) => {
      const questionId = Object.keys(answer).toString();
      requests.push(
        this.patientIntakeQuestionService.addPatientIntakeQuestionAnswerByPatientIntakeQuestionId(
          questionId,
          (answer as any)[questionId]
        )
      );
    });

    if (this.patientIntakeQuestionAnswersOriginal.length) {
      intakeAnswersArray.forEach((answer: any, index: number) => {
        if (!this.patientIntakeQuestionAnswersOriginal[index]) {
          return;
        }
        const questionId = Object.keys(answer).toString();
        requests.push(
          this.patientIntakeQuestionService.editPatientIntakeQuestionAnswerByPatientIntakeQuestionId(
            questionId,
            answer[questionId]
          )
        );
      });
    }

    this.patientContactsToRemove
      .filter((patientContactId: string) => !!patientContactId)
      .forEach((patientContactId: string) => {
        requests.push(
          this.patientContactService
            .removePatientContactByPatientContactId(patientContactId)
            .pipe(tap(() => this.toastrService.success('Successfully removed patient contact')))
        );
      });

    this.patientContactsToAdd = this.patientContacts.filter(
      (patientContact: PatientContact) => !patientContact.patientContactId
    );
    this.patientContactsToAdd.forEach((patientContact: PatientContact) => {
      const index = parseInt(patientContact.patientContactOrder, 10) - 1;
      const submittedContact = formSubmission.patient.patientContacts[index];
      requests.push(
        this.patientContactService
          .addNewPatientContactByPatientId(this.patient.patientId, this.patientContactPostFactory(submittedContact))
          .pipe(tap(() => this.toastrService.success('Successfully added patient contact')))
      );
    });

    this.patientContactsToEdit = this.patientContacts.filter((patientContact: PatientContact) => {
      if (!patientContact.patientContactId) {
        return false;
      }
      const index = parseInt(patientContact.patientContactOrder, 10) - 1;
      const submittedContact = {
        ...formSubmission.patient.patientContacts[index],
        patientContactId: patientContact.patientContactId,
        patientId: this.patient.patientId
      };
      return !_.isEqual(patientContact, submittedContact);
    });

    this.patientContactsToEdit.forEach((patientContact: PatientContact) => {
      const index = parseInt(patientContact.patientContactOrder, 10) - 1;
      const submittedContact = {
        ...formSubmission.patient.patientContacts[index],
        patientContactId: patientContact.patientContactId,
        patientId: this.patient.patientId
      };
      requests.push(
        this.patientContactService
          .editPatientContactByPatientId(
            patientContact.patientContactId,
            this.patientContactPutFactory(submittedContact)
          )
          .pipe(tap(() => this.toastrService.success('Successfully edited patient contact')))
      );
    });

    return requests;
  }

  editPatient(formSubmission: any) {
    this.isSaving = true;
    this.getPatientSaveRequest(formSubmission)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => this.handlePatientSaveSuccess(),
        error: () => this.handlePatientSaveError()
      });
  }

  private getPatientSaveRequest(formSubmission: any): Observable<any> {
    return this.patientService.editPatientByPatientId(
      this.patient.patientId,
      this.formSubmissionFactory(formSubmission)
    );
  }

  private handlePatientSaveSuccess() {
    this.toastrService.success('Successfully edited patient!');
    this.userService.updateOperations(this.user).then(() => {
      this.navigateTo('/operations/' + this.patientForm.get('patient.operation').value + '/patients');

      if (!this.mode.edit) {
        this.patientForm.reset();
      }
    });
  }

  private handlePatientSaveError() {
    this.toastrService.error('Patient was not saved. Your entries are still here; please review them and try again.');
  }
  patientContactPutFactory(patientContact: PatientContact): PatientContactPutBody {
    const isResponsibleParty = patientContact.patientContactResponsiblePartyBoolean == true;
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
        patientContactHIPAABoolean: isResponsibleParty ? 1 : 0,
        patientContactResponsiblePartyBoolean: isResponsibleParty ? 1 : 0
      };
      return <PatientContactPutBody>payload;
    } catch {
      throw 'Had a problem validating data in the call rep factory';
    }
  }
  patientContactPostFactory(patientContact: PatientContact): PatientContactPostBody {
    const isResponsibleParty = patientContact.patientContactResponsiblePartyBoolean == true;
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
        patientContactHIPAABoolean: isResponsibleParty ? 1 : 0,
        patientContactResponsiblePartyBoolean: isResponsibleParty ? 1 : 0
      };
      return <PatientContactPostBody>payload;
    } catch {
      throw 'Had a problem validating data in the patient contact factory!';
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
    const normalizedPatientDob = this.normalizeDischargeDateValue(formSubmission.patient.patientDob);
    var patientDob = normalizedPatientDob.substr(0, 10) + 'T12:00:00.00Z';
    const normalizedAdmitDate = this.normalizeDischargeDateValue(formSubmission.patient.dischargeInfo.patientAdmitDate);
    const normalizedDischargeDate = this.normalizeDischargeDateValue(
      formSubmission.patient.dischargeInfo.patientDischargeDate
    );
    var patientAdmitDate = normalizedAdmitDate.substr(0, 10) + 'T12:00:00.00Z';
    var patientDischargeDate = normalizedDischargeDate.substr(0, 10) + 'T12:00:00.00Z';
    const doesNotSpeakEnglish = formSubmission.patient.patientSpeaksEnglish === true;
    const patientFluentLanguage = doesNotSpeakEnglish
      ? (formSubmission.patient.patientFluentLanguage || '').toString().trim()
      : '';

    const patientMedicalConditions = JSON.stringify(formSubmission.patient.patientMedicalConditions);
    var payload = {
      patientDob: patientDob,
      patientOperationId: formSubmission.patient.operation,
      patientMedicalRecordNumber: formSubmission.patient.patientMedicalRecordNumber,
      patientFirstName: formSubmission.patient.patientName.patientFirstName,
      patientLastName: formSubmission.patient.patientName.patientLastName,
      patientCountryCode: formSubmission.patient.patientCountryCode || '',
      patientAreaCode: formSubmission.patient.patientAreaCode || '',
      patientPhoneNumber: this.formatPhoneInputValue(formSubmission.patient.patientPhoneNumber),
      patientGender: formSubmission.patient.patientGender,
      patientHIPAA: formSubmission.patient.patientIsResponsibleParty == true ? 1 : 0,
      patientIsResponsibleParty: formSubmission.patient.patientIsResponsibleParty == true ? 1 : 0,
      patientSpeaksEnglish: doesNotSpeakEnglish ? 0 : 1,
      patientFluentLanguage: patientFluentLanguage,
      patientHospitalAdmitted: formSubmission.patient.hospitalAdmitted.patientHospitalAdmitted || '',
      patientPrimaryInsurance: formSubmission.patient.hospitalAdmitted.patientHospitalAdmitted || '',
      patientAdmitDate: patientAdmitDate,
      patientDischargeDate: patientDischargeDate,
      patientDischargedAma: formSubmission.patient.dischargeInfo.patientDischargedAma == true ? 1 : 0,
      patientDischargeLabelId: formSubmission.patient.dischargeInfo.patientDischargedTo,
      patientDischargedCondition: formSubmission.patient.patientDischargedCondition
        ? formSubmission.patient.patientDischargedCondition
        : '',
      patientPrimaryDiagnosis: formSubmission.patient.patientPrimaryDiagnosis,
      patientMedicalConditions: patientMedicalConditions,
      patientNeedToKnow: formSubmission.patient.patientNeedToKnow || '',
      patientActive: formSubmission.patient.patientActive == true ? 1 : 0
    };
    return <PatientPutBody>payload;
  }

  private normalizeContactResponsiblePartyBoolean(patientContact: PatientContact): boolean {
    return !!(
      patientContact &&
      (patientContact.patientContactResponsiblePartyBoolean == true ||
        patientContact.patientContactHIPAABoolean == true)
    );
  }

  private normalizePatientResponsiblePartyBoolean(patient: Patient): boolean {
    return !!(patient && (patient.patientIsResponsibleParty == true || patient.patientHIPAA == true));
  }

  private formatPhoneInputValue(phoneValue: string): string {
    if (!phoneValue) {
      return '';
    }

    const digits = phoneValue.toString().replace(/[^0-9]/g, '');

    if (digits.length === 7) {
      return digits.substr(0, 3) + '-' + digits.substr(3);
    }

    if (digits.length === 10) {
      return digits.substr(0, 3) + '-' + digits.substr(3, 3) + '-' + digits.substr(6);
    }

    return phoneValue.toString();
  }

  private normalizeDischargeDateValue(dateValue: string): string {
    if (!dateValue || typeof dateValue !== 'string') {
      return dateValue;
    }

    const trimmedDate = dateValue.trim();

    if (!trimmedDate) {
      return '';
    }

    if (trimmedDate.includes('/')) {
      const dateParts = trimmedDate.split('/');

      if (dateParts.length !== 3) {
        return trimmedDate;
      }

      const parsedMonth = parseInt(dateParts[0], 10);
      const parsedDay = parseInt(dateParts[1], 10);
      const parsedYear = parseInt(dateParts[2], 10);

      if ([parsedMonth, parsedDay, parsedYear].some(value => isNaN(value))) {
        return trimmedDate;
      }

      const correctedYear = parsedYear >= 1900 ? parsedYear : parsedYear >= 100 ? parsedYear : parsedYear + 2000;
      const normalizedDate =
        correctedYear.toString().padStart(4, '0') +
        '-' +
        parsedMonth.toString().padStart(2, '0') +
        '-' +
        parsedDay.toString().padStart(2, '0');

      return this.isNormalizedDischargeDateValue(normalizedDate) ? normalizedDate : trimmedDate;
    }

    const normalizedDate = trimmedDate.substr(0, 10);
    const dateParts = normalizedDate.split('-');

    if (dateParts.length !== 3) {
      return normalizedDate;
    }

    const parsedYear = parseInt(dateParts[0], 10);

    if (isNaN(parsedYear)) {
      return normalizedDate;
    }

    if (parsedYear >= 1900) {
      return normalizedDate;
    }

    const correctedYear = parsedYear >= 100 ? parsedYear : parsedYear + 2000;
    return correctedYear.toString().padStart(4, '0') + '-' + dateParts[1] + '-' + dateParts[2];
  }

  private isNormalizedDischargeDateValue(dateValue: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || '')) {
      return false;
    }

    const [year, month, day] = dateValue.split('-').map(value => parseInt(value, 10));
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    return (
      parsedDate.getUTCFullYear() === year &&
      parsedDate.getUTCMonth() === month - 1 &&
      parsedDate.getUTCDate() === day
    );
  }

  private syncTypedDateControl(controlPath: string, typedValue: string) {
    const control = this.patientForm?.get(controlPath);
    if (!control) {
      return;
    }

    const normalized = this.normalizeDischargeDateValue((typedValue || '').trim());
    control.setValue(this.isNormalizedDischargeDateValue(normalized) ? normalized : '', { emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
  }

  private readonly dischargeDateOrderValidator = (control: AbstractControl): ValidationErrors | null => {
    const admitDate = this.normalizeDischargeDateValue(control.get('patientAdmitDate')?.value);
    const dischargeDate = this.normalizeDischargeDateValue(control.get('patientDischargeDate')?.value);

    if (!this.isNormalizedDischargeDateValue(admitDate) || !this.isNormalizedDischargeDateValue(dischargeDate)) {
      return null;
    }

    return dischargeDate < admitDate ? { dischargeBeforeAdmit: true } : null;
  };

  private getPatientDobControlValue(): string {
    const control = this.patientForm?.get('patient.patientDob');
    return this.normalizeDischargeDateValue(control?.value);
  }

  private getDischargeDateControlValue(controlName: DischargeDateControlName): string {
    const control = this.patientForm?.get('patient.dischargeInfo.' + controlName);
    return this.normalizeDischargeDateValue(control?.value);
  }

  /**
   * A function to validate controls,
   * and if there are any validation errors,
   * bounce the user to the top.
   */
  validateControls(): boolean {
    this.patientForm?.markAllAsTouched();
    this.patientForm?.updateValueAndValidity();

    if (this.patientForm && this.patientForm.valid) {
      return true;
    }

    const firstError = this.getFirstInvalidValidationElement();

    if (firstError) {
      this.getValidationScrollTarget(firstError).scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      this.focusValidationElement(firstError);
      alert('Unable to save. Please check ' + this.getValidationFieldLabel(firstError) + '.');
      return false;
    }

    if (this.patientForm?.invalid) {
      alert('Unable to save. Please check the highlighted required fields. Your entries have been preserved.');
      return false;
    }

    return true;
  }

  private getFirstInvalidValidationElement(): HTMLElement | null {
    const invalidDomSelectors = [
      'ion-input.ng-invalid',
      'ion-select.ng-invalid',
      'ion-textarea.ng-invalid',
      'ion-radio-group.ng-invalid',
      'ion-checkbox.ng-invalid',
      'input.ng-invalid',
      'textarea.ng-invalid',
      'select.ng-invalid'
    ].join(', ');

    const invalidCandidates = new Set<HTMLElement>();

    document.querySelectorAll(invalidDomSelectors).forEach(node => {
      const element = node as HTMLElement;

      if (!this.isHiddenValidationElement(element)) {
        invalidCandidates.add(element);
      }
    });

    this.addCustomInvalidValidationCandidate(invalidCandidates, 'patient.operation', '.facility-picker-trigger');
    this.addCustomInvalidValidationCandidate(invalidCandidates, 'patient.patientDob', '.patient-dob-wrapper .date-input-shell');
    this.addCustomInvalidValidationCandidate(
      invalidCandidates,
      'patient.dischargeInfo.patientAdmitDate',
      '.discharge-admit-date .date-input-shell'
    );
    this.addCustomInvalidValidationCandidate(
      invalidCandidates,
      'patient.dischargeInfo.patientDischargeDate',
      '.discharge-discharge-date .date-input-shell'
    );
    this.addCustomInvalidValidationCandidate(
      invalidCandidates,
      'patient.dischargeInfo',
      '.discharge-discharge-date .date-input-shell'
    );

    return Array.from(invalidCandidates).sort((left, right) => {
      if (left === right) {
        return 0;
      }

      const position = left.compareDocumentPosition(right);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    })[0] || null;
  }

  private addCustomInvalidValidationCandidate(
    candidates: Set<HTMLElement>,
    controlPath: string,
    selector: string
  ) {
    const control = this.patientForm?.get(controlPath);
    const element = document.querySelector(selector) as HTMLElement | null;

    if (control?.invalid && element) {
      candidates.add(element);
    }
  }

  private isHiddenValidationElement(element: HTMLElement): boolean {
    return element instanceof HTMLInputElement && element.type === 'hidden';
  }

  private getValidationScrollTarget(element: HTMLElement): HTMLElement {
    return (
      (element.closest(
        'ion-item, .patient-dob-wrapper, .form-row, .discharged-ama, .patient-checkbox-grid, .patient-contact-flags, .patient-discharge-dates-container, .call-question-body-container'
      ) as HTMLElement | null) || element
    );
  }

  private getValidationFieldLabel(element: HTMLElement): string {
    if (element.matches('.facility-picker-trigger') || element.closest('.patient-facility')) {
      return 'Facility';
    }
    if (element.closest('.patient-dob-wrapper')) {
      return 'Birthday';
    }
    if (element.closest('.discharge-admit-date')) {
      return 'Admitted date';
    }
    if (element.closest('.discharge-discharge-date')) {
      return this.patientForm?.get('patient.dischargeInfo')?.hasError('dischargeBeforeAdmit')
        ? 'Discharged date (it cannot be before the admitted date)'
        : 'Discharged date';
    }

    const label = element.closest('ion-item, .form-row, .discharged-ama')?.querySelector('ion-label, label');
    const labelText = (label?.textContent || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim().replace(/:$/, '');
    return labelText || 'the first highlighted field';
  }

  private focusValidationElement(element: HTMLElement) {
    const focusTarget = (element.matches('input:not([type="hidden"]), textarea, select, button, ion-input, ion-select, ion-textarea, ion-radio, ion-checkbox')
      ? element
      : element.querySelector(
          'input:not([type="hidden"]), textarea, select, button, ion-input, ion-select, ion-textarea, ion-radio, ion-checkbox'
        )) as (HTMLElement & { setFocus?: () => Promise<void> }) | null;

    if (focusTarget?.setFocus) {
      void focusTarget.setFocus();
    } else {
      focusTarget?.focus();
    }
  }

  private navigateTo(url: string): void {
    window.location.href = url;
  }

  private reloadPage(): void {
    window.location.reload();
  }

  ngOnDestroy() {
    this.patient = null;
  }
}
