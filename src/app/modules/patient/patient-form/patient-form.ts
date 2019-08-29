import { PatientQuestionAnswer } from '../patient-question/patient-question.service';

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
  patientAdmissionDate: Date;
  patientDischargeDate: Date;
  patientDischargedAma: boolean;
  patientDischargeLocationLabelId: number;
  patientPrimaryDiagnosis: string;
  patientDiagnosis: {};
  patientUrgencyScale: number;
  patientNeedToKnow: string;
  patientQuestionAnswers: PatientQuestionAnswer[];
}
