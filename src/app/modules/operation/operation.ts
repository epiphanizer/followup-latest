import { OperationContact } from './operation-contact/operation-contact';
import { OperationCallRep } from './operation-callreps.service';
import { Observable } from 'rxjs';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';

export interface Operation {
  operationId: number;
  operationName?: string;
  operationAddress?: string;
  operationCity?: string;
  operationState?: string;
  operationZip?: string;
  operationCountryCode?: number;
  operationAreaCode?: number;
  operationPhoneNumber?: string;
  operationActive?: number;
  operationContacts$?: Observable<OperationContact[]>;
  operationAssignedManagerUserId?: number;
  operationAssignedManagerName?: string;
  operationCallReps$?: Observable<OperationCallRep[]>;
  /**
   * Some counters that don't always
   * attach to the object,
   * but are nice to have when the time comes.
   */
  currentAssignedPatientCount?: number;
  currentNewNotificationCount?: number;
  currentNewDischargeCount?: number;
  patientCalls?: PatientCall[];
  patientCalls$?: Observable<PatientCall[]>;
  todaysScheduledCalls: number;
}

export interface OperationPutBody {
  operationName: string;
  operationAddress: string;
  operationCity: string;
  operationState: string;
  operationZip: string;
  operationCountryCode: string;
  operationAreaCode: string;
  operationPhoneNumber: string;
  operationActive: number;
}

export interface OperationManager {
  operationId: number;
  userId: number;
}
export interface OperationManagerPostBody {
  operationId: number;
  userId: number;
}

export interface OperationCallRepPostBody {
  operationId: number;
  userId: number;
}
