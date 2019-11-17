export interface PatientContact {
  patientContactId?: number;
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactOrder: number;
  patientResponsiblePartyBoolean: boolean;
}
export interface PatientContactPostBody {
  patientContactFirstName: string;
  patientContactLastName: string;
  patientContactRelationship: string;
  patientContactCountryCode: string;
  patientContactAreaCode: string;
  patientContactPhoneNumber: string;
  patientContactResponsiblePartyBoolean: boolean;
}
