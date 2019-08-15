import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { Patient, PatientService } from './patient.service';
import { PatientCallService } from './patient-detail/patient-call/patient-call.service';
import { map } from 'rxjs/operators';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  patient: Patient;
  patient$: Observable<Patient>;
  constructor(
    private operationService: OperationService,
    private patientService: PatientService,
    private patientCallService: PatientCallService
  ) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    this.patient$ = this.patientService.getPatientByPatientId(+patientId).pipe(
      map((patient: Patient) => {
        debugger;
        patient.operation$ = this.operationService.getOperationByOperationId(patient.patientOperationId);
        patient.patientCalls$ = this.patientCallService.getPatientCallsByPatientId(patient.patientId);

        this.patient = patient;
        return patient;
      })
    );
    return this.patient$;
  }
}
