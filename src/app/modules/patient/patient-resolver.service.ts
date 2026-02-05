import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { Patient } from './patient';
import { PatientService } from './patient.service';
import { map, share, take } from 'rxjs/operators';
import { PatientContactService } from './patient-contact/patient-contact.service';
import { PatientCallService } from './patient-detail/patient-call/patient-call.service';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  patient: Patient;
  patient$: Observable<Patient>;
  constructor(
    private patientService: PatientService,
    private patientCallService: PatientCallService,
    private patientContactService: PatientContactService
  ) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    this.patient$ = this.patientService.getPatientByPatientId(patientId).pipe(
      take(1),
      map((patient: Patient) => {
        patient = patient[0];
        this.patient = patient;
        this.patient.patientLanguages$ = this.patientService.getPatientLanguagesByPatientId(this.patient.patientId);
        this.patient.patientContacts$ = this.patientContactService
          .getPatientContactsByPatientId(this.patient.patientId)
          .pipe(share());
        this.patient.patientCalls$ = this.patientCallService
          .getPatientCallsByPatientId(this.patient.patientId)
          .pipe(share());
        return patient;
      }),
      share()
    );
    return this.patient$;
  }
}
