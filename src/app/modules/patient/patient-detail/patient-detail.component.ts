import { Component, OnInit } from '@angular/core';
import { Patient } from '@app/modules/patient/patient.service';
import { PatientCall, PatientCallService } from '../patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient;
  patientCall: PatientCall = null;
  patientCall$: Observable<PatientCall>;
  constructor(private patientCallService: PatientCallService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.patient = this.route.snapshot.data.patient;
  }

  startPatientCall() {
    this.patientCall$ = this.patientCallService.addPatientCallByPatientId(this.patient.id);
  }
}
