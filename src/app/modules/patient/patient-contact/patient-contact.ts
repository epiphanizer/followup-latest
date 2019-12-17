export interface PatientContact {
  patientContactId?: number;
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactOrder: string;
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
  patientContactOrder: string;
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
  patientContactOrder: string;
  patientContactResponsiblePartyBoolean: number;
}
