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

  constructor(private formBuilder: FormBuilder, private patientService: PatientService) {}

  ngOnInit() {
    this.patient$ = this.patientService.addNewPatient();
    this.createForm();
  }
  updateUserProfile() {
    alert('updating user profile');
  }
  private createForm() {
    this.addPatientForm = this.formBuilder.group({});
  }
}
