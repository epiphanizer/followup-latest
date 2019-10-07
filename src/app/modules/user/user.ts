import { Operation } from '@app/modules/operation/operation.service';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';

export interface User {
  displayName: string;
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userPhoneCountryCode?: number;
  userPhoneAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
  userLastAccess?: Date;
  token: string;
  id: string;
  id$: Observable<number>;
  level: number;
  email: string;
  avatar: string;
  operations: Array<Operation>;
  operations$: Observable<Array<Operation>>;
  patientCalls: Array<PatientCall>;
  patientCalls$: Observable<PatientCall[]>;
}

export interface UserPostObject {}
export interface UserPutObject {
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userPhoneCountryCode?: number;
  userPhoneAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
}
