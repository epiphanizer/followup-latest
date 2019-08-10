import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { Patient, PatientService } from './patient.service';
import { PatientCallService } from './patient-call/patient-call.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  patient: Patient;
  patient$: Observable<Patient>;
  constructor(private patientService: PatientService, private patientCallService: PatientCallService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    this.patient$ = this.patientService.getPatientByPatientId(+patientId).pipe(
      map((patient: Patient) => {
        patient.patientCalls$ = this.patientCallService.getPatientCallsByPatientId(patient.patientId);
        return patient;
      })
    );
    return this.patient$;
  }
}
