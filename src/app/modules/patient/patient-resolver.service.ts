import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Patient } from './patient';
import { PatientService } from './patient.service';
import { map } from 'rxjs/operators';
import { PatientContactService } from './patient-contact/patient-contact.service';

@Injectable()
export class PatientResolver implements Resolve<Patient> {
  patient: Patient;
  patient$: Observable<Patient>;
  constructor(private patientService: PatientService, private patientContactService: PatientContactService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Patient> {
    const patientId = route.paramMap.get('patientId');
    this.patient$ = this.patientService.getPatientByPatientId(+patientId).pipe(
      map((patient: Patient) => {
        patient = patient[0];
        this.patient = patient;
        this.patient.patientContacts$ = this.patientContactService.getPatientContactsByPatientId(
          this.patient.patientId
        );
        return patient;
      })
    );
    return this.patient$;
  }
}
