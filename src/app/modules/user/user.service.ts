import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Operation, OperationService } from '@app/modules/operation/operation.service';

export interface User {
  displayName: string;
  token: string;
  id: number;
  level: number;
  email: string;
  avatar: string;
  operations$: Observable<Array<Operation>>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {}
}
