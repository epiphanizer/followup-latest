import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Patient } from './patient';
import { PatientService } from './patient.service';
import { PatientCallService, PatientCall } from './patient-detail/patient-call/patient-call.service';
import { map } from 'rxjs/operators';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  patient: Patient;
  patient$: Observable<Patient>;
  constructor(private patientService: PatientService, private patientCallsService: PatientCallService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    this.patient$ = this.patientService.getPatientByPatientId(+patientId).pipe(
      map((patient: Patient) => {
        patient = patient[0];
        this.patient = patient;
        this.patientCallsService
          .getPatientCallsByPatientId(this.patient.patientId)
          .subscribe((patientCalls: PatientCall[]) => {
            this.patient.patientCalls = patientCalls;
          });
        return patient;
      })
    );
    return this.patient$;
  }
}
