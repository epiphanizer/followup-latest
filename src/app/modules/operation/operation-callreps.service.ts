import { Injectable } from '@angular/core';

export interface operationCallRep {
  operationCallRepId: number;
  operationCallRepName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationCallrepsService {
  constructor() {}
}
