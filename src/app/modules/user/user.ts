import { Operation } from '@app/modules/operation/operation';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';

export interface User {
  userId: number;
  userLevel: number;
  username: string;
  email: string;
  avatar?: boolean;
  operations: Array<Operation>;
  operations$: Observable<Array<Operation>>;
  patientCalls: Array<PatientCall>;
  patientCalls$: Observable<PatientCall[]>;
  token: string;
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userCountryCode?: number;
  userAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
  userFavoriteDessert?: string;
  userInterests:
    | {
        celebrity: boolean;
        helicopter: boolean;
        kidney: boolean;
        skydivedOrBungeed: boolean;
        appearedOnTv: boolean;
        janeAusten: boolean;
        escargo: boolean;
        deployed: boolean;
        instrument: boolean;
        seenTornado: boolean;
        hitchhiked: boolean;
        DND: boolean;
      }
    | any;
  userAdditionalInfo: string;
  userLastAccess?: Date;
}

export interface UserPutObject {
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userCountryCode?: number;
  userAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
  userFavoriteDessert: string;
  userInterests?: string;
  userAdditionalInfo?: string;
}
