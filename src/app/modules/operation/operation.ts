import { OperationContact } from './operation-contact/operation-contact';
import { Observable } from 'rxjs';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';
import { User, UserLanguage } from '../user/user';

export interface Operation {
  operationId: number;
  operationGroupId: number;
  operationGroupName?: string;
  operationName?: string;
  operationAddress?: string;
  operationCity?: string;
  operationState?: string;
  operationZip?: string;
  operationCountryCode?: number;
  operationAreaCode?: number;
  operationPhoneNumber?: string;
  operationActive?: number;
  operationArchive?: number;
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
  spanishSpeaking?: Boolean;
  todaysCallCount?: number;
  languages$: Observable<UserLanguage[]>;
  languages: UserLanguage[];
}

export interface OperationPutBody {
  operationName: string;
  operationGroupId: number;
  operationAddress: string;
  operationCity: string;
  operationState: string;
  operationZip: string;
  operationCountryCode: string;
  operationAreaCode: string;
  operationPhoneNumber: string;
  operationActive: number;
  operationArchive: number;
}
export interface OperationGroup {
  operationGroupId?: number;
  operationGroupName: string;
  operations?: Operation[];
  operations$?: Observable<Operation[]>;
  // control state for the sidebar
  sidebarDropdownOpen?: Boolean;
}

export interface OperationManager {
  operationManagerId?: number;
  operationManagerName?: string;
  operationId: number;
  userId: number;
}

/**
 * Generally, just extend the user, but also
 * give them a call rep id (future proofing)
 */
export interface OperationCallRep {
  userId: number;
  operationCallRepId: number;
  operationCallRepName: string;
}
export interface OperationManagerPostBody {
  operationId: number;
  userId: number;
}

export interface OperationCallRepPostBody {
  operationId: number;
  userId: number;
}
