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
  patientMiddleName?: string;
  patientLastName: string;
  patientPrimaryInsurance: string;
  patientSecondaryInsurance: string;
  patientAdmitDate: string;
  patientDischargeDate: string;
  patientDischargedAma: number | boolean;
  patientDischargeLabelId: number;
  patientMedicalConditions: string;
  patientUrgencyScale: number;
  patientNeedToKnow: string;
}
