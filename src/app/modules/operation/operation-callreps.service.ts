import { Injectable } from '@angular/core';

export interface OperationCallRep {
  operationCallRepId: number;
  operationCallRepName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationCallrepsService {
  constructor() {}
}
