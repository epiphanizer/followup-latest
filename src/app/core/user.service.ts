import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { Client } from '@microsoft/microsoft-graph-client';

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
@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService, private http: HttpClient, private jwtService: JwtService) {}

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    // If JWT detected, attempt to get & store user's info
    // if (this.jwtService.getToken()) {
    this.apiService.get('/user').subscribe(
      data => data.user
      // data => this.setAuth(data.user),
      // err => this.purgeAuth()
    );
    // } else {
    // Remove any potential remnants of previous auth states
    // this.purgeAuth();
    // }
  }

  public getUserIdByMicrosoftGUID(userMicrosoftGUID: string) {
    this.apiService.get('/users/search/' + userMicrosoftGUID);
  }

  private assignUserAccessLevel = function(userId: number) {
    let url = '/users' + userId;
    /**
     * Call to Graph to get the users group.
     
    POST /users/{id | userPrincipalName}/getMemberGroups
    securityEnabledOnly
    */
    // const result = someCall();

    return 1;
  };

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  /**
   * A function to get the appropriate user menu to display on the initial dashboard.
   * Question: Do we include the option to skip this screen and make a screen a favorite?
   */
  public getUserMenu = function() {
    try {
      switch (this.user.level) {
        case 1:
          this.menu = [
            { name: 'Call Queue', action: '/call-queue', image: '/assets/icon-call-queue.png' },
            { name: 'My Profile', action: '/profile', image: this.user.avatar }
          ];
          break;
        case 2:
          this.menu = [
            { name: 'Patients', action: '/patients', image: '/assets/icon-patients.png' },
            { name: 'Notifications', action: '/notifications', image: '/assets/icon-notifications.png' },

            { name: 'My Profile', action: '/profile', image: '/assets/profile.png' }
            //
            // { name: 'My Profile', action: '/profile', image: this.getUserAvatarImgSrc() }
          ];
          break;
        case 3:
          this.menu = [
            { name: 'Facilities', action: '/facilities', image: '/assets/icon-facilities.png' },
            { name: 'User Management', action: '/user-management', image: '/assets/icon-user-management.png' },
            { name: 'View Queue', action: '/view-queue', image: '/assets/icon-view-queue.png' },
            { name: 'View Data', action: '/reports', image: '/assets/icon-view-data.png' }
          ];
          break;
        default:
          throw 'No User ID given';
          break;
      }
    } catch (e) {
      this.logger.error('some error', e);
    }
  };
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
