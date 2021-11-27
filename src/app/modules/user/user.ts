import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';

export interface User {
  userId: string;
  teamId?: string;
  userRoleType?: string;
  username: string;
  userEmail: string;
  avatarData?: Blob;
  avatar?: boolean;
  operations: any | Array<Operation>;
  operationGroups: any | Array<OperationGroup>;
  patientCalls: Array<PatientCall>;
  patientCalls$: Observable<PatientCall[]>;
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userCountryCode?: number;
  userAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
  userSpeaksSpanish: boolean;
  userFavoriteDessert?: string;
  userInterests:
    | {
        celebrity: any;
        helicopter: any;
        kidney: any;
        skydivedOrBungeed: any;
        appearedOnTv: any;
        janeAusten: any;
        escargo: any;
        deployed: any;
        instrument: any;
        seenTornado: any;
        hitchhiked: any;
        DND: any;
      }
    | any;
  userAdditionalInfo: string;
  userLastAccess?: Date;
  userLoginExpires: number;
  userMessages: UserMessage[];
  userLanguages: UserLanguage[];
}

export interface UserPutObject {
  userFirstName: string;
  userMiddleName?: string;
  userLastName: string;
  userCountryCode?: number;
  userAreaCode?: number;
  userPhoneNumber?: number;
  userSpeaksSpanish?: boolean;
  userDob?: Date;
  userFavoriteDessert: string;
  userInterests?: string;
  userAdditionalInfo?: string;
}

export interface UserMessage {
  teamId?: number;
  messageId: number;
  messageSenderUserId: number;
  messageSenderFirstName?: string;
  messageRecipientUserId?: number;
  messageRecipientFirstName?: string;
  messageBody: string;
  messageSentDate?: Date;
  messageAcknowledged?: number;
  messageAcknowledgedDate?: Date | null;
}

export interface UserLanguage {
  userLanguageId: number;
  languageId: number;
  languageLabel: string;
}

export enum UserRoles {
  admin = 1,
  manager = 2,
  user = 3
}
