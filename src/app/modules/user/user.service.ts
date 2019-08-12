import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Operation } from '@app/modules/operation/operation.service';

export interface User {
  displayName: string;
  token: string;
  id: number;
  id$: Observable<number>;
  level: number;
  email: string;
  avatar: string;
  operations: Array<Operation>;
  operations$: Observable<Array<Operation>>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  updateUserProfile(userId: number, formData: FormData) {
    this.http.post('user/' + userId, formData);
  }
}
