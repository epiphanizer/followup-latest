import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface User {
  displayName: string;
  id: number;
  level: number;
  email: string;
  avatar: string;
}
@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService, private http: HttpClient, private jwtService: JwtService) {}

  public getUserIdByMicrosoftGUID(userMicrosoftGUID: string) {
    this.apiService.get('/users/' + 'match/' + userMicrosoftGUID);
  }
  private getUserLevel = function(userId: number) {
    let url = '/users' + userId;
    /**
     * Call to Graph to get the users group.
     
    POST /users/{id | userPrincipalName}/getMemberGroups
    securityEnabledOnly
    */
    // const result = someCall();

    return 1;
  };
}
