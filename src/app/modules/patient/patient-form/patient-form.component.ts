import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user.service';
import { map } from 'rxjs/operators';

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
  user: User;
  patient$: Observable<Patient> | void;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private patientService: PatientService) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    /**
     * See if we are editing the form
     */
    this.user = this.route.snapshot.data.user;

    if (this.route.snapshot.data.editMode) {
      this.editMode = true;
    }
    if (this.editMode) {
      this.patient = this.route.snapshot.data.patient;
    }
    if (!this.patient) {
      this.patient$ = this.patientService.addNewPatient().pipe(
        map((data: Patient) => {
          this.patient = data;
          this.createForm();
          return data;
        })
      );
    } else {
      this.createForm();
    }
  }

  addPatientFormSubmit() {}
  private createForm() {
    this.addPatientForm = this.fb.group({
      operation: this.fb.control({}),
      patient: this.fb.group({
        patientMedicalRecordNumber: this.fb.control({}),
        patientName: this.fb.group({
          patientFirstName: this.fb.control({}),
          patientMiddleName: this.fb.control({}),
          patientLastName: this.fb.control({})
        }),
        patientDob: this.fb.control({}),
        patientContacts: this.fb.group({
          primaryPatientContact: this.fb.group({
            patientContactCountryCodeNumber: this.fb.control({}),
            patientContactAreaCodeNumber: this.fb.control({}),
            patientContactPhoneNumber: this.fb.control({}),
            patientResponsiblePartyBoolean: this.fb.control({})
          }),
          alternatePatientContact1: this.fb.group({
            patientContactFirstName: this.fb.control({}),
            patientContactLastName: this.fb.control({}),
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
        physicianFirstName: this.fb.control({}),
        physicianLastName: this.fb.control({}),
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
      }),
      patientUrgencyRating: this.fb.control({}),
      patientNeedToKnow: this.fb.control({})
    });
  }
  updateResponsibleParty() {
    console.log('updating responsible party');
    // this.patient.patientResponsibleParty =
  }
}
