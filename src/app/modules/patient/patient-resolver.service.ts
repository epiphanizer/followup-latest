import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Patient } from './patient';
import { PatientService } from './patient.service';
import { map } from 'rxjs/operators';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  patient: Patient;
  patient$: Observable<Patient>;
  constructor(private patientService: PatientService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    this.patient$ = this.patientService.getPatientByPatientId(+patientId).pipe(
      map((patient: Patient) => {
        patient = patient[0];
        this.patient = patient;
        return patient;
      })
    );
    return this.patient$;
  }
}
