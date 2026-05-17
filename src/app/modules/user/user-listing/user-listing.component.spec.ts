import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core';
import { UserRoles } from '../user';
import { UserService } from '../user.service';

import { UserListingComponent } from './user-listing.component';

describe('UserListingComponent (Jest)', () => {
  let component: UserListingComponent;
  let fixture: ComponentFixture<UserListingComponent>;
  const authenticationService = {
    currentUserValue: {
      userId: 'admin-1',
      userLevel: UserRoles.admin
    }
  } as any;
  const userService = {
    getAllUsers: jest.fn(),
    generateUserMergeScript: jest.fn()
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    userService.getAllUsers.mockReturnValue(
      of([
        {
          userId: 'u1',
          userLevel: UserRoles.user,
          username: 'asmith',
          userEmail: null,
          userFirstName: 'Anna',
          userLastName: 'Smith',
          userActive: false,
          deleted: true,
          userCreated: '2024-01-01T00:00:00.000Z',
          userModified: '2024-01-02T00:00:00.000Z'
        },
        {
          userId: 'u2',
          userLevel: UserRoles.user,
          username: 'asmith@followupcare.com',
          userEmail: 'asmith@followupcare.com',
          userFirstName: 'Anna',
          userLastName: 'Smith',
          userActive: true,
          deleted: false,
          userCreated: '2025-01-01T00:00:00.000Z',
          userModified: '2025-01-03T00:00:00.000Z'
        }
      ])
    );
    userService.generateUserMergeScript.mockReturnValue(of({ mergeScript: 'SELECT 1;' }));

    await TestBed.configureTestingModule({
      declarations: [UserListingComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { user: { userId: 'u1' } } } } },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: UserService, useValue: userService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
    expect(component.user.userId).toBe('admin-1');
    expect(component.duplicateGroups.length).toBe(1);
    expect(component.duplicateGroups[0].selectedTargetUserId).toBe('u2');
    expect(component.duplicateGroups[0].collapsed).toBe(false);
  });

  it('requests a merge script for a selected source account', () => {
    const group = component.duplicateGroups[0];
    const sourceUser = group.users.find(user => user.userId === 'u1') as any;

    component.generateMergeScript(group as any, sourceUser);

    expect(userService.generateUserMergeScript).toHaveBeenCalledWith('admin-1', 'u1', 'u2');
    expect(group.mergeScript).toBe('SELECT 1;');
  });

  it('collapses, expands, and jumps duplicate groups', () => {
    const group = component.duplicateGroups[0];
    const scrollSpy = jest.fn();
    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: scrollSpy
    } as any);

    component.collapseAllGroups();
    expect(group.collapsed).toBe(true);

    component.jumpToGroup(group as any);
    expect(group.collapsed).toBe(false);
    expect(scrollSpy).toHaveBeenCalled();

    component.toggleGroup(group as any);
    expect(group.collapsed).toBe(true);

    getElementByIdSpy.mockRestore();
  });
});
