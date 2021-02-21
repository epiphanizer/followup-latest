export interface FormEntry {
  dateSubmitted: string;
  submissionId: string;
  submission: {};
}

/**
 * Anything date related is a UTC-based,
 * ISO date format inside of a string
 */
export interface PatientPutBody {
  patientActive: number | boolean;
  patientDob: string;
  patientOperationId: number;
  patientMedicalRecordNumber: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender: boolean;
  patientSpeaksEnglish: boolean;
  patientIsResponsibleParty: boolean;
  patientHIPAA: boolean;
  patientFluentLanguage: string;
  patientCountryCode: number;
  patientAreaCode: number;
  patientPhoneNumber: string;
  patientPrimaryInsurance: string;
  patientPhysicianName: string;
  patientPhysicianPhoneNumber: string;
  patientAdmitDate: string;
  patientDischargeDate: string;
  patientDischargedAma: number | boolean;
  patientDischargeLabelId: number;
  patientMedicalConditions: string;
  patientNeedToKnow: string;
}
