export interface FormEntry {
  dateSubmitted: string;
  submissionId: string;
  submission: {};
}

export interface PatientPutBody {
  patientActive: number;
  patientDob: Date;
  patientOperationId: number;
  patientMedicalRecordNumber: number;
  patientFirstName: string;
  patientMiddleName?: string;
  patientLastName: string;
  patientPhysicianFirstName: string;
  patientPhysicianLastName: string;
  patientPhysicianCountryCode: string;
  patientPhysicianAreaCode: string;
  patientPhysicianPhoneNumber: string;
  patientPrimaryInsurance: string;
  patientSecondaryInsurance: string;
  patientAdmitDate: Date;
  patientDischargeDate: Date;
  patientDischargedAma: boolean;
  patientDischargeLocationLabelId: number;
  patientPrimaryDiagnosis: string;
  patientDiagnosis: string;
  patientUrgencyScale: number;
  patientNeedToKnow: string;
  patientIntakeQuestionAnswers: string;
}
