export interface PatientContact {
  patientContactId?: string;
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
  patientContactId: string;
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
  patientId: string;
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
