import { Observable } from 'rxjs';
import { PatientCall } from './patient-detail/patient-call/patient-call.service';
import { Operation } from '../operation/operation.service';
import { PatientQuestion } from './patient-question/patient-question.service';
import { PatientContact } from './patient-contact';

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
  operation$: Observable<Operation>;
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
  patientContacts$: Observable<PatientContact[]>;
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
  patientCalls$: Observable<PatientCall[]>;
  patientCallCount?: number;
  patientNextCallTime?: Date;
  patientCurrentStatusLabel?: number;
  patientDischargeNotes: string;
  patientDischargedAma?: boolean;
  patientDischargedConditions?: {
    cardiac?: boolean;
    sepsis?: boolean;
    pulmonary?: boolean;
    patientDischargedCondition?: string;
  };
  patientDischargeLabelId?: number;
  patientDischargeLabel?: string;
  patientDiagnosis?: string;
  patientPrimaryDiagnosis?: string;
  patientIntakeQuestions?: PatientQuestion[];
  patientIntakeQuestions$?: Observable<PatientQuestion[]>;
  patientUrgencyRating?: number;
  patientNeedToKnow?: string;
  nextPatientCallId?: number;
}

export interface PatientDischargeLabel {
  patientDischargeLabelId: number;
  patientDischargeLabel: string;
}
