import { OperationContact } from './operation-contact/operation-contact';
import { Observable } from 'rxjs';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';
import { User } from '../user/user';

export interface Operation {
  operationId: string;
  operationGroupId: string;
  operationGroupName?: string;
  operationGroupShortName?: string;
  operationName?: string;
  operationAddress?: string;
  operationCity?: string;
  operationState?: string;
  operationZip?: string;
  operationCountryCode?: number;
  operationAreaCode?: number;
  operationPhoneNumber?: string;
  operationActive?: number;
  operationStartDate: Date;
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
  totalNotifications?: number;
  totalGraduates?: number;
  operationSpanishSpeaking?: boolean;
}

export interface OperationPutBody {
  operationName: string;
  operationGroupId: string;
  operationAddress: string;
  operationCity: string;
  operationState: string;
  operationZip: string;
  operationCountryCode: string;
  operationAreaCode: string;
  operationPhoneNumber: string;
  operationActive: number;
}
export interface OperationGroup {
  operationGroupId?: string;
  operationGroupName: string;
  operationGroupShortName?: string;
  operations?: Operation[];
  operations$?: Observable<Operation[]>;
  // control state for the sidebar
  sidebarDropdownOpen?: Boolean;
}

export interface OperationGroupPutBody {
  operationGroupName: string;
  operationGroupShortName: string;
}

export interface OperationManager extends User {
  operationManagerId?: string;
  operationManagerName?: string;
  operationId: string;
  userId: string;
}

/**
 * Generally, just extend the user, but also
 * give them a call rep id (future proofing)
 */
export interface OperationCallRep {
  userId: string;
  userRoleLabel?: string;
  operationId: string;
  operationCallRepId?: string;
  operationCallRepName?: string;
}
export interface OperationManagerPostBody {
  operationId: string;
  userId: string;
}

export interface OperationCallRepPostBody {
  operationId: string;
  userId: string;
}
