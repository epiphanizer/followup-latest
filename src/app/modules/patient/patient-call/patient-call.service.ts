import { Injectable } from '@angular/core';

export interface PatientCall {
  patientCallId: number;
  patientCallStatusId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientCallService {
  constructor() {}
}
