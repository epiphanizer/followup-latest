import { Component, OnInit } from '@angular/core';
import { Patient } from '@app/modules/patient/patient.service';
import { PatientCall, PatientCallService } from '../patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  user: User;
  patient: Patient;
  selected: {
    patientCall: PatientCall | null;
  } = {
    patientCall: null
  };
  patientCall: PatientCall | null = null;
  patientCall$: Observable<PatientCall>;
  constructor(private patientCallService: PatientCallService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
  }
  patientCallStartEventHandler($event: Event) {
    alert('parent component is aware of patient call being started');
  }
}
