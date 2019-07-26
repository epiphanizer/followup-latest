import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { GraphService } from '../graph.service';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface User {
  displayName: string;
  token: string;
  id: number;
  level: number;
  email: string;
  avatar: string;
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
    private http: HttpClient,
    private graphService: GraphService,
    private jwtService: JwtService
  ) {}

  populate() {
    this.apiService.get('/user').subscribe(data => data.user);
  }

  public getUserIdByMicrosoftGUID(userMicrosoftGUID: string) {
    this.apiService.get('/users/search/' + userMicrosoftGUID);
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  setAuth(user: User) {
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  attemptAuth(type: string, credentials: string): Observable<User> {
    let route = type === 'login' ? '/login' : '';
    return this.apiService.post('/users' + route, { user: credentials }).map(data => {
      this.setAuth(data.user);
      return data;
    });
  }

  protected getUserAvatarImgSrc = function(userId: number) {
    console.log('Getting user avatar src');

    return 'src';
  };

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
