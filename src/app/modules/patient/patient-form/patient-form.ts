export interface FormEntry {
  dateSubmitted: string;
  submissionId: string;
  submission: {};
}

export interface PatientPutBody {
  patientActive: number | boolean;
  patientDob: Date;
  patientOperationId: number;
  patientMedicalRecordNumber: string;
  patientFirstName: string;
  patientMiddleName?: string;
  patientLastName: string;
  patientPrimaryInsurance: string;
  patientSecondaryInsurance: string;
  patientAdmitDate: Date;
  patientDischargeDate: Date;
  patientDischargedAma: number | boolean;
  patientDischargeLabelId: number;
  patientMedicalConditions: string;
  patientUrgencyScale: number;
  patientNeedToKnow: string;
}
