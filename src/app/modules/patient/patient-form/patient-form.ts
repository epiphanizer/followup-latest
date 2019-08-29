export interface FormEntry {
  dateSubmitted: string;
  submissionId: string;
  submission: {};
}

export interface PatientPutBody {
  patientActive: number;
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
  patientDiagnosis: {};
  patientNeedToKnow: string;
  patientPainScaleAtIntake: number;
  patientMentalScaleAtIntake: number;
  patientUrgencyScale: number;
  patientAdmitDate: Date;
  patientDischargeDate: Date;
  patientDob: Date;
}
