import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { OperationAdminRightSidebarComponent } from './operation-admin-right-sidebar.component';
import { OperationService } from '../operation.service';
import { OperationCallRepsService } from '../operation-callreps.service';
import { ToastrService } from 'ngx-toastr';

describe('OperationAdminRightSidebarComponent', () => {
  let component: OperationAdminRightSidebarComponent;
  let fixture: ComponentFixture<OperationAdminRightSidebarComponent>;
  const operationServiceMock: any = {
    getUsersAssignedByOperationId: jest.fn(() =>
      of([
        {
          userId: 'm1',
          userFirstName: 'Manny',
          userLastName: 'Beta',
          operationUserRoleLabel: 'Manager',
          accessSourceLabel: 'Inherited',
          inheritedOperationUserRoleLabelId: 2,
          inheritedOperationUserRoleLabel: 'Manager'
        },
        {
          userId: 'u1',
          userFirstName: 'Alice',
          userLastName: 'Alpha',
          operationUserRoleLabel: 'Care Rep',
          accessSourceLabel: 'Direct',
          directOperationUserRoleLabelId: 3,
          directOperationUserRoleLabel: 'Care Rep'
        }
      ])
    ),
    assignManagerToOperationByOperationIdAndUserId: jest.fn(() => of({})),
    removeCallRepOrManager: jest.fn(() => of(true)),
    removeManagerByOperationIdAndUserId: jest.fn(() => of(true))
  };
  const operationCallRepsServiceMock: any = {
    deleteOperationCallRepByOperationCallRepId: jest.fn(() => of({})),
    addOperationCallRepByOperationIdAndUserId: jest.fn(() => of({}))
  };
  const toastrMock: any = { success: jest.fn(), error: jest.fn() };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperationAdminRightSidebarComponent],
        providers: [
          { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'op1' }) } },
          { provide: OperationService, useValue: operationServiceMock },
          { provide: OperationCallRepsService, useValue: operationCallRepsServiceMock },
          { provide: ToastrService, useValue: toastrMock }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
    fixture = TestBed.createComponent(OperationAdminRightSidebarComponent);
    component = fixture.componentInstance;
    component.mode = { add: false, edit: true } as any;
    component.operation = { operationId: 'op1' } as any;
    (component as any).operationCallRepsService = operationCallRepsServiceMock;
    fixture.detectChanges();
  });

  it('initializes managers and call reps from services', () => {
    expect(component.operationManagersOriginal).toEqual([]);
    expect(component.operationAssignedUsersOriginal).toEqual(['u1']);
    expect(component.operationManagers[0].accessSourceLabel).toBe('Inherited');
  });

  it('swaps call reps and persists add/remove', () => {
    component.operationAssignedUsers = [{ userId: 'u1', operationId: 'op1' } as any];
    component.operationAssignedUsersOriginal = ['u1'];
    component.operationAssignedUsersToRemove = [];

    component.callRepOnSelect({ target: { value: 'u2' } }, 0);

    expect(operationCallRepsServiceMock.deleteOperationCallRepByOperationCallRepId).toHaveBeenCalledWith('op1', 'u1');
    expect(operationCallRepsServiceMock.addOperationCallRepByOperationIdAndUserId).toHaveBeenCalledWith('op1', 'u2');
  });

  it('assigns managers and toggles menus', () => {
    component.operationManagers = [{ userId: 'm2', operationId: 'op1' } as any];
    component.operationManagersOriginal = [];

    component.managerOnSelect({ detail: { value: 'm2' } }, 0);
    expect(operationServiceMock.assignManagerToOperationByOperationIdAndUserId).toHaveBeenCalledWith('op1', 'm2');

    const initial = component.managerSidebarDropdownOpen;
    component.toggleOperationManagersAssignedMenu();
    expect(component.managerSidebarDropdownOpen).toBe(!initial);
  });

  it('adds placeholders for new reps', () => {
    component.operationAssignedUsers = [];
    component.addAdditionalOperationCallRep();
    expect(component.operationAssignedUsers[0].userId).toBe(0);
  });

  it('does not remove inherited assignments through direct-write endpoints', () => {
    component.operationManagers = [
      {
        userId: 'm1',
        accessSourceLabel: 'Inherited',
        inheritedOperationUserRoleLabelId: 2
      } as any
    ];

    component.removeCallRepOrManager('manager', 0, 'm1');

    expect(operationServiceMock.removeManagerByOperationIdAndUserId).not.toHaveBeenCalled();
    expect(toastrMock.error).toHaveBeenCalledWith(
      'This assignment is inherited from Team Access. Update it from the Teams section.'
    );
  });

  it('keeps team-access context when removing only the direct portion of an assignment', () => {
    component.operationManagers = [
      {
        userId: 'm2',
        directOperationUserRoleLabelId: 2,
        directOperationUserRoleLabel: 'Manager',
        inheritedOperationUserRoleLabelId: 2,
        inheritedOperationUserRoleLabel: 'Manager',
        accessSourceLabel: 'Direct + Team'
      } as any
    ];

    component.removeCallRepOrManager('manager', 0, 'm2');

    expect(operationServiceMock.removeManagerByOperationIdAndUserId).toHaveBeenCalledWith('op1', 'm2');
    expect(toastrMock.success).toHaveBeenCalledWith('Direct assignment removed. Team Access still applies.');
  });

  it('sorts direct role assignments ahead of inherited team rows', () => {
    component.effectiveAssignedUsers = [
      {
        userId: 'm1',
        userFirstName: 'Ina',
        userLastName: 'Inherited',
        operationUserRoleLabel: 'Manager',
        accessSourceLabel: 'Inherited',
        inheritedOperationUserRoleLabelId: 2,
        inheritedOperationUserRoleLabel: 'Manager'
      },
      {
        userId: 'm2',
        userFirstName: 'Dara',
        userLastName: 'Direct',
        operationUserRoleLabel: 'Manager',
        accessSourceLabel: 'Direct',
        directOperationUserRoleLabelId: 2,
        directOperationUserRoleLabel: 'Manager'
      }
    ] as any;

    (component as any).syncManagerRowsFromEffectiveAssignments();

    expect(component.operationManagers.map(manager => manager.userId)).toEqual(['m2', 'm1']);
  });
});
