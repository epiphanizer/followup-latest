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
  patientDob: Date;
}
