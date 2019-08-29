export interface FormEntry {
  dateSubmitted: string;
  submissionId: string;
  submission: {};
}

export interface PatientPutBody {
  patientOperationId: number;
  patientMedicalRecordNumber: number;
  patientFirstName: string;
  patientMiddleName: string;
  patientLastName: string;
  patientDiagnosis: string;
  patientNeedToKnow: string;
  patientPainScaleAtIntake: number;
  patientMentalScaleAtIntake: number;
  patientUrgencyScale: number;
  patientAdmitDate: Date;
  patientDischargeDate: Date;
  patientDob: Date;
  patientActive: number;
}
