import { Observable } from 'rxjs';
import { PatientCall } from './patient-detail/patient-call/patient-call.service';
import { Operation } from '../operation/operation';
import { PatientContact } from './patient-contact/patient-contact';
import {
  PatientIntakeQuestion,
  PatientIntakeQuestionAnswer
} from './patient-intake-question/patient-intake-question.component';
import { Notification } from '@app/modules/notification/notification';
import { UserLanguage } from '../user/user';

/**
 * Regarding this interface ---
 * we are only ever sure of the patientId
 * upon first introduction of the Patient object
 * as a return from initializing it. Thus,
 * all other parameters have the (?) optional operator attached.
 */
export interface Patient {
  patientId: number;
  patientOperationId?: number;
  patientOperationName?: string;
  operation?: Operation;
  operation$?: Observable<Operation>;
  patientFirstName?: string;
  patientMiddleName?: string;
  patientLastName?: string;
  patientMedicalRecordNumber?: string;
  patientAdmitDate?: Date;
  patientDischargeDate?: Date;
  patientTotalDays?: number;
  patientDob?: Date;
  patientAge?: number | null;
  patientGender?: string;
  patientCountryCode?: number;
  patientAreaCode?: number;
  patientPhoneNumber?: string;
  patientHIPAA?: boolean;
  patientSpeaksEnglish?: boolean;
  patientIsResponsibleParty?: boolean;
  patientLanguages$?: Observable<UserLanguage[]>;
  patientLanguages?: UserLanguage[];
  avatar?: string;
  patientContacts$?: Observable<PatientContact[]>;
  patientContactNumberId?: number | null;
  patientContactPhoneNumber?: number | null;
  primaryContactPhoneTypeId?: number;
  primaryContactPhoneTypeLabel?: string;
  primaryContactPhoneNumber?: number | null;
  patientPhysicianName?: string;
  patientPhysicianPhoneNumber?: string;
  patientPrimaryInsurance?: string;
  patientCalls?: PatientCall[];
  patientCalls$?: Observable<PatientCall[]>;
  patientNotifications?: Notification[];
  patientNotifications$?: Observable<Notification[]>;
  patientCallCount?: number;
  patientLastCallDate?: Date;
  patientNextCallScheduledTime?: Date;
  patientCurrentStatusLabel?: number;
  patientStatusLabel?: string;
  patientDischargeNotes?: string;
  patientDischargedAma?: boolean;
  patientMedicalConditions?:
    | any
    | {
        sepsisBoolean: boolean;
        cardiacBoolean: boolean;
        pulmonaryBoolean: boolean;
      };
  patientDischargeLabelId?: number;
  patientDischargeLabel?: string;
  patientDischargedCondition?: string;
  patientPrimaryDiagnosis?: string;
  patientIntakeQuestions?: PatientIntakeQuestion[];
  patientIntakeQuestions$?: Observable<PatientIntakeQuestion[]>;
  patientIntakeQuestionAnswers?: PatientIntakeQuestionAnswer[];
  patientIntakeQuestionAnswers$?: Observable<PatientIntakeQuestionAnswer[]>;
  patientUrgencyScale?: number;
  patientNeedToKnow?: string;
  nextPatientCallId?: number;
  patientActive?: number;
}

export interface PatientDischargeLabel {
  patientDischargeLabelId: number;
  patientDischargeLabel: string;
}

export enum PatientRelationshipTypes {
  'Spouse',
  'Child',
  'Parent',
  'Relative',
  'Friend',
  'Sig. Other',
  'Other'
}
