import { Observable } from 'rxjs';
import { PatientCall } from './patient-detail/patient-call/patient-call.service';
import { Operation } from '../operation/operation.service';

export interface Patient {
  patientId: number;
  patientOperationId: number;
  operation?: Operation;
  operation$: Observable<Operation>;
  patientFirstName: string;
  patientMiddleName: string;
  patientLastName: string;
  patientMedicalRecordNumber: string;
  patientAdmissionDate: Date;
  patientDischargeDate: Date;
  patientDob: Date;
  age: number | null;
  avatar: string;
  // We may not always have these parameters when,
  // but it's nice to have when we do need them.
  patientContactNumberId?: number | null;
  patientContactPhoneNumber?: number | null;
  primaryContactPhoneTypeId?: number;
  primaryContactPhoneTypeLabel?: string;
  primaryContactPhoneNumber?: number | null;
  patientCalls?: PatientCall[];
  patientCalls$: Observable<PatientCall[]>;
  patientCallCount?: number;
  patientCurrentStatusLabel?: number;
}
