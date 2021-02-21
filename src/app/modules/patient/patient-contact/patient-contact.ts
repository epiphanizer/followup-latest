export interface PatientContact {
  patientContactId?: number;
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactOrder: string;
  patientContactHIPAABoolean: boolean;
  patientContactResponsiblePartyBoolean: boolean;
}
export interface PatientContactPutBody {
  patientContactId: number;
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactOrder: number;
  patientContactHIPAABoolean: number;
  patientContactResponsiblePartyBoolean: number;
}
export interface PatientContactPostBody {
  patientId: number;
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactOrder: number;
  patientContactResponsiblePartyBoolean: number;
}
