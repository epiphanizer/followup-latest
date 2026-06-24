import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
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
    generateUserMergeScript: jest.fn(),
    executeUserMerge: jest.fn()
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    authenticationService.currentUserValue = {
      userId: 'admin-1',
      userLevel: UserRoles.admin
    } as any;
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
    userService.executeUserMerge.mockReturnValue(
      of({
        sourceUserId: 'u1',
        targetUserId: 'u2',
        commitChanges: true,
        transactionOutcome: 'COMMIT',
        message: 'Merge committed successfully.',
        finalUsers: [
          { userId: 'u1', userActive: false, deleted: true },
          { userId: 'u2', userActive: true, deleted: false }
        ]
      })
    );

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

  it('loads the roster for managers without granting admin-only debug mode', async () => {
    authenticationService.currentUserValue = {
      userId: 'manager-1',
      userLevel: UserRoles.manager
    } as any;

    const managerFixture = TestBed.createComponent(UserListingComponent);
    const managerComponent = managerFixture.componentInstance;
    managerFixture.detectChanges();

    expect(managerComponent.canManageUsers).toBe(true);
    expect(managerComponent.isAdmin).toBe(false);
    expect(userService.getAllUsers).toHaveBeenCalled();
  });

  it('requests a merge script for a selected source account', () => {
    const group = component.duplicateGroups[0];
    const sourceUser = group.users.find(user => user.userId === 'u1') as any;

    component.generateMergeScript(group as any, sourceUser);

    expect(userService.generateUserMergeScript).toHaveBeenCalledWith('admin-1', 'u1', 'u2');
    expect(group.mergeScript).toBe('SELECT 1;');
  });

  it('executes a merge workup for a selected source account after confirmation', () => {
    const group = component.duplicateGroups[0];
    const sourceUser = group.users.find(user => user.userId === 'u1') as any;
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.executeMerge(group as any, sourceUser);

    expect(confirmSpy).toHaveBeenCalled();
    expect(userService.executeUserMerge).toHaveBeenCalledWith('admin-1', 'u1', 'u2');
    expect(group.mergeResult?.transactionOutcome).toBe('COMMIT');
    expect(group.users.find(user => user.userId === 'u1')?.deleted).toBe(true);
  });

  it('shows the backend execute error message when a merge fails', () => {
    const group = component.duplicateGroups[0];
    const sourceUser = group.users.find(user => user.userId === 'u1') as any;
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    userService.executeUserMerge.mockReturnValue(
      throwError(() => ({ error: { message: 'The merge workup exceeded the current API timeout.' } }))
    );

    component.executeMerge(group as any, sourceUser);

    expect(group.mergeError).toBe('The merge workup exceeded the current API timeout.');
    confirmSpy.mockRestore();
  });

  it('derives the highest effective role from nested operation access', () => {
    component.users = [
      {
        userId: 'u3',
        userLevel: UserRoles.user,
        username: 'mgr-user',
        userFirstName: 'Morgan',
        userLastName: 'Lee',
        operations: [{ userRoleLabel: 'Manager' }]
      }
    ] as any;

    expect(component.getUserRoleLabel(component.users[0] as any)).toBe('Manager');
  });

  it('collapses, expands, and jumps duplicate groups', () => {
    const group = component.duplicateGroups[0];
    const jumpSpy = jest.spyOn(component as any, 'jumpTo').mockResolvedValue(undefined);

    component.collapseAllGroups();
    expect(group.collapsed).toBe(true);

    component.jumpToGroup(group as any);
    expect(group.collapsed).toBe(false);
    expect(jumpSpy).toHaveBeenCalled();

    component.toggleGroup(group as any);
    expect(group.collapsed).toBe(true);

    jumpSpy.mockRestore();
  });
});
