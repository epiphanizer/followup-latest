import { Observable } from 'rxjs';
import { PatientCall } from './patient-detail/patient-call/patient-call.service';
import { Operation } from '../operation/operation.service';

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
  patientContactNumberId?: number | null;
  patientContactPhoneNumber?: number | null;
  primaryContactPhoneTypeId?: number;
  primaryContactPhoneTypeLabel?: string;
  primaryContactPhoneNumber?: number | null;
  patientCalls?: PatientCall[];
  patientCalls$: Observable<PatientCall[]>;
  patientCallCount?: number;
  patientOnFinalCall?: boolean;
  patientCurrentStatusLabel?: number;
  patientDischargedAma?: boolean;
  patientDischargedConditions?: number[];
  patientDischargeLabel?: string;
  patientPrimaryDiagnosis?: string;
}
