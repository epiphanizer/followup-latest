import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [PatientService],
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  addPatientForm: FormGroup;
  currentYear: number;
  editMode: boolean = false;
  patient: Patient;
  patient$: Observable<Patient>;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private patientService: PatientService) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    /**
     * See if we are editing the form
     */
    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
    }
    if (this.editMode) {
      this.patient = this.route.snapshot.data.patient;
    }
    if (!this.patient) {
      this.patient$ = this.patientService.addNewPatient();
    }
    this.createForm();
  }
  addPatientFormSubmit() {}
  private createForm() {
    this.addPatientForm = this.fb.group({
      operation: this.fb.control({}),
      patient: this.fb.group({
        patientRecordNumber: this.fb.control(this.patient.medicalRecordNumber),
        patientName: this.fb.group({
          patientFirstName: this.fb.control(this.patient.patientFirstName),
          patientMiddleName: this.fb.control(this.patient.patientMiddleName),
          patientLastName: this.fb.control(this.patient.patientLastName)
        }),
        patientDob: this.fb.control(this.patient.patientDob),
        // We calculate the age and set this later
        patientAge: this.fb.control({
          value: null,
          disabled: true
        }),
        patientContacts: this.fb.group({
          primaryPatientContact: this.fb.group({
            patientContactName: this.fb.control({}),
            patientContactRelationship: this.fb.control({}),
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({}),
            patientResponsiblePartyBoolean: this.fb.control({})
          }),
          alternatePatientContact1: this.fb.group({
            patientContactName: this.fb.control({}),
            patientContactRelationship: this.fb.control({}),
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({}),
            patientResponsiblePartyBoolean: this.fb.control({})
          }),
          alternatePatientContact2: this.fb.group({
            patientContactName: this.fb.control({}),
            patientContactRelationship: this.fb.control({}),
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({}),
            patientResponsiblePartyBoolean: this.fb.control({})
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
  updateResponsibleParty() {
    alert('Updating responsible party');
  }
}
