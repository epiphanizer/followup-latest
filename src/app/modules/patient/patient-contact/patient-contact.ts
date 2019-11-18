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
export interface PatientContactPostBody {
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactOrder: string;
  patientContactResponsiblePartyBoolean: boolean;
}
