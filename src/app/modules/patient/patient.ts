import { Observable } from 'rxjs';
import { PatientCall } from './patient-detail/patient-call/patient-call.service';
import { Operation } from '../operation/operation';
import { PatientContact } from './patient-contact/patient-contact';
import { PatientIntakeQuestion } from './patient-intake-question/patient-intake-question.component';

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
  avatar?: string;
  patientContacts$?: Observable<PatientContact[]>;
  patientContactNumberId?: number | null;
  patientContactPhoneNumber?: number | null;
  primaryContactPhoneTypeId?: number;
  primaryContactPhoneTypeLabel?: string;
  primaryContactPhoneNumber?: number | null;
  patientPhysicianFirstName?: string;
  patientPhysicianLastName?: string;
  patientPhysicianCountryCode?: number;
  patientPhysicianAreaCode?: number;
  patientPhysicianPhoneNumber?: string;
  patientPrimaryInsurance?: string;
  patientSecondaryInsurance?: string;
  patientCalls?: PatientCall[];
  patientCalls$?: Observable<PatientCall[]>;
  patientCallCount?: number;
  patientLastCallDate?: Date;
  patientNextCallScheduledTime?: Date;
  patientCurrentStatusLabel?: number;
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
  patientDiagnosis?: string;
  patientPrimaryDiagnosis?: string;
  patientIntakeQuestions?: PatientIntakeQuestion[];
  patientIntakeQuestions$?: Observable<PatientIntakeQuestion[]>;
  patientUrgencyScale?: number;
  patientNeedToKnow?: string;
  nextPatientCallId?: number;
  patientActive?: number;
}

export interface PatientDischargeLabel {
  patientDischargeLabelId: number;
  patientDischargeLabel: string;
}
