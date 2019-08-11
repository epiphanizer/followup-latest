import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  providers: [PatientService],
  selector: 'app-patient-add',
  templateUrl: './patient-add.component.html',
  styleUrls: ['./patient-add.component.scss']
})
export class PatientAddComponent implements OnInit {
  addPatientForm: FormGroup;
  patient: Patient;
  patient$: Observable<Patient>;

  constructor(private fb: FormBuilder, private patientService: PatientService) {}

  ngOnInit() {
    this.patient$ = this.patientService.addNewPatient();
    this.createForm();
  }
  addPatientFormSubmit() {
    alert('adding new patient');
  }
  private createForm() {
    this.addPatientForm = this.fb.group({
      operation: this.fb.control({}),
      patient: this.fb.group({
        name: this.fb.control({}),
        age: this.fb.control({}),
        patientMedicalRecordNumber: this.fb.control({}),
        patientContacts: this.fb.group({
          primaryPatientContact: this.fb.group({
            patientContactName: this.fb.control({}),
            patientContactRelationship: this.fb.control({}),
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({})
          }),
          alternatePatientContact1: this.fb.group({
            patientContactName: this.fb.control({}),
            patientContactRelationship: this.fb.control({}),
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({})
          }),
          alternatePatientContact2: this.fb.group({
            patientContactName: this.fb.control({}),
            patientContactRelationship: this.fb.control({}),
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({})
          })
        })
      }),
      physician: this.fb.group({
        physicianName: this.fb.control({}),
        physicianPhoneNumber: this.fb.control({})
      }),
      insurance: this.fb.group({
        primaryInsurance: this.fb.control({}),
        secondaryInsurance: this.fb.control({})
      }),
      dischargeInfo: this.fb.group({
        patientAdmitDate: this.fb.control({}),
        patientDischargeDate: this.fb.control({}),
        patientStayLength: this.fb.control({}),
        patientDischargedAma: this.fb.control({}),
        patientDischargedTo: this.fb.control({})
      }),
      patientMedicalConditions: this.fb.group({
        cardiacBoolean: this.fb.control({}),
        sepsisBoolean: this.fb.control({}),
        pulminaryBoolean: this.fb.control({}),
        primaryDiagnosis: this.fb.control({}),
        dischargedCondition: this.fb.control({})
      }),
      patientQuestionAnswers: this.fb.group({
        painScaleAtIntake: this.fb.control({}),
        mentalScaleAtIntake: this.fb.control({}),
        patientMedicationBoolean: this.fb.control({}),
        patientAppointmentScheduledWithDoctorBoolean: this.fb.control({}),
        patientHomeHealthContactedBoolean: this.fb.control({}),
        patientUrgencyRating: this.fb.control({}),
        patientOtherDetails: this.fb.control({})
      })
    });
  }
}
