import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { Patient, PatientService } from './patient.service';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  constructor(private patientService: PatientService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    return this.patientService.getPatientByPatientId(+patientId);
  }
}
