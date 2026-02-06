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
      of([{ userId: 'u1', userRoleLabel: 'Care Rep', userLastName: 'Alpha' }])
    ),
    getOperationManagersByOperationId: jest.fn(() => of([{ userId: 'm1', userLastName: 'Beta' }])),
    assignManagerToOperationByOperationIdAndUserId: jest.fn(() => of({})),
    removeCallRepOrManager: jest.fn(() => of(true))
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
    fixture = TestBed.createComponent(OperationAdminRightSidebarComponent);
    component = fixture.componentInstance;
    component.mode = { add: false, edit: true } as any;
    component.operation = { operationId: 'op1' } as any;
    (component as any).operationCallRepsService = operationCallRepsServiceMock;
    fixture.detectChanges();
  });

  it('initializes managers and call reps from services', () => {
    expect(component.operationManagersOriginal).toEqual(['m1']);
    expect(component.operationAssignedUsersOriginal).toEqual(['u1']);
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
    component.operationManagers = [{ userId: 'm1', operationId: 'op1' } as any];
    component.operationManagersOriginal = ['m1'];

    component.managerOnSelect({ target: { value: 'm2' } }, 0);
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
});
