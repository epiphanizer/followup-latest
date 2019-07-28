import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

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
  operations: [Operation];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthenticationService,
    private graphService: GraphService,
    private operationService: OperationService
  ) {}

  populate() {
    this.apiService.get('/user').subscribe(data => {
      this.currentUser = data.user;
      return this.getCurrentUser();
    });
  }

  public getUserIdByMicrosoftGUID(userMicrosoftGUID: string) {
    this.apiService.get('/users/search/' + userMicrosoftGUID);
  }

  public getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  setAuth(user: User) {
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  // Update the user on the server (email, pass, etc)
  update(user: User): Observable<User> {
    return this.apiService.put('/user', { user }).pipe(
      map(data => {
        // Update the currentUser observable
        this.currentUserSubject.next(data.user);
        return data.user;
      })
    );
  }
}
