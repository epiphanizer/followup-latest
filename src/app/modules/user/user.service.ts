import { Injectable } from '@angular/core';

import { GraphService } from '@app/shared/graph.service';

import { ApiService } from '@app/core/api.service';
import { AuthenticationService } from '@app/core/authentication/auth.service';
import { Operation, OperationService } from '@app/modules/operation/operation.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface User {
  displayName: string;
  token: string;
  id: number;
  level: number;
  email: string;
  avatar: string;
  operations?: Array<Operation>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {}
