import { of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { OperationService } from '@app/modules/operation/operation.service';
import { UserRoles } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';
import { AuthenticationService } from '@app/core';
import { TeamAccessComponent } from './team-access.component';
import { TeamService } from '../team.service';

const teamServiceStub = {
  getTeams: jest.fn(() => of([{ teamId: 't1', teamName: 'Team One' }])),
  getTeamMembersByTeamId: jest.fn(() =>
    of([
      {
        teamMemberId: 'm1',
        userId: 'u1',
        teamMemberFirstName: 'Ada',
        teamMemberLastName: 'Lovelace',
        teamMemberRoleLabel: 'Manager'
      },
      {
        teamMemberId: 'm2',
        userId: 'u2',
        teamMemberFirstName: 'Grace',
        teamMemberLastName: 'Hopper',
        teamMemberRoleLabel: 'Care Rep'
      }
    ])
  ),
  getTeamOperationAssignmentsByTeamId: jest.fn(() =>
    of([
      {
        teamId: 't1',
        operationId: 'op1',
        operationGroupName: 'Group A',
        operationName: 'Operation 1',
        operationUserRoleLabelId: 2,
        operationUserRoleLabel: 'Manager'
      }
    ])
  ),
  setTeamOperationAssignmentsByTeamId: jest.fn(() =>
    of([
      {
        teamId: 't1',
        operationId: 'op1',
        operationGroupName: 'Group A',
        operationName: 'Operation 1',
        operationUserRoleLabelId: 2,
        operationUserRoleLabel: 'Manager'
      },
      {
        teamId: 't1',
        operationId: 'op2',
        operationGroupName: 'Group A',
        operationName: 'Operation 2',
        operationUserRoleLabelId: 3,
        operationUserRoleLabel: 'Care Rep'
      }
    ])
  ),
  getTeamMemberOperationAccessByTeamIdAndTeamMemberId: jest.fn(() =>
    of([
      {
        teamId: 't1',
        teamMemberId: 'm1',
        userId: 'u1',
        operationId: 'op1',
        operationGroupName: 'Group A',
        operationName: 'Operation 1',
        memberAccessMode: 'default',
        teamOperationUserRoleLabel: 'Manager',
        effectiveOperationUserRoleLabel: 'Manager',
        effectiveAccessSourceLabel: 'Inherited'
      },
      {
        teamId: 't1',
        teamMemberId: 'm1',
        userId: 'u1',
        operationId: 'op2',
        operationGroupName: 'Group A',
        operationName: 'Operation 2',
        memberAccessMode: 'override',
        memberOverrideOperationUserRoleLabelId: 3,
        memberOverrideOperationUserRoleLabel: 'Care Rep',
        effectiveOperationUserRoleLabel: 'Care Rep',
        effectiveAccessSourceLabel: 'Inherited'
      }
    ])
  ),
  setTeamMemberOperationAccessByTeamIdAndTeamMemberId: jest.fn(() =>
    of([
      {
        teamId: 't1',
        teamMemberId: 'm1',
        userId: 'u1',
        operationId: 'op1',
        operationGroupName: 'Group A',
        operationName: 'Operation 1',
        memberAccessMode: 'revoke',
        effectiveAccessSourceLabel: ''
      },
      {
        teamId: 't1',
        teamMemberId: 'm1',
        userId: 'u1',
        operationId: 'op2',
        operationGroupName: 'Group A',
        operationName: 'Operation 2',
        memberAccessMode: 'override',
        memberOverrideOperationUserRoleLabelId: 3,
        memberOverrideOperationUserRoleLabel: 'Care Rep',
        effectiveOperationUserRoleLabel: 'Care Rep',
        effectiveAccessSourceLabel: 'Inherited'
      }
    ])
  )
};

const operationServiceStub = {
  getAllOperations: jest.fn(() =>
    of([
      { operationId: 'op1', operationGroupName: 'Group A', operationName: 'Operation 1', operationActive: 1 },
      { operationId: 'op2', operationGroupName: 'Group A', operationName: 'Operation 2', operationActive: 1 }
    ])
  )
};

const activatedRouteStub: Partial<ActivatedRoute> = {
  snapshot: {
    params: { teamId: 't1' },
    queryParamMap: {
      get: (_key: string): string | null => null
    }
  } as any,
  paramMap: of({ get: (key: string) => (key === 'teamId' ? 't1' : null) }) as any,
  queryParamMap: of({ get: (_key: string): string | null => null }) as any
};

const toastrStub = {
  success: jest.fn(),
  error: jest.fn()
};

const userServiceStub = {
  impersonateUser: jest.fn(() => of({ userId: 'u1' }))
};

const authServiceStub = {
  currentUserValue: { userId: 'admin1', userLevel: UserRoles.admin },
  impersonatorValue: null as any,
  startImpersonation: jest.fn(() => Promise.resolve({ userId: 'u1' }))
};

const routerStub = {
  navigate: jest.fn()
};

describe('TeamAccessComponent (Jest)', () => {
  const buildComponent = () =>
    new TeamAccessComponent(
      activatedRouteStub as ActivatedRoute,
      routerStub as any,
      teamServiceStub as unknown as TeamService,
      operationServiceStub as unknown as OperationService,
      userServiceStub as unknown as UserService,
      authServiceStub as unknown as AuthenticationService,
      toastrStub as unknown as ToastrService
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads grouped team access entries', () => {
    const component = buildComponent();

    component.ngOnInit();

    expect(component.team?.teamName).toBe('Team One');
    expect(component.teamAccessClients.length).toBe(1);
    expect(component.teamAccessClients[0].entries[0].selectedRoleId).toBe(2);
    expect(component.teamAccessClients[0].enabled).toBe(true);
    expect(component.teamMembers.length).toBe(2);
    expect(component.groupedMemberEntries.length).toBe(1);
  });

  it('saves desired-state assignments', () => {
    const component = buildComponent();

    component.ngOnInit();
    const client = component.teamAccessClients[0];
    const op2Entry = client.entries.find(entry => entry.operationId === 'op2')!;
    component.onOperationRoleChange(client, op2Entry, 3);
    component.saveAssignments();

    expect(teamServiceStub.setTeamOperationAssignmentsByTeamId).toHaveBeenCalledWith('t1', [
      {
        operationId: 'op1',
        operationUserRoleLabelId: 2,
        defaultManagerTeamMemberId: undefined,
        defaultCareRepTeamMemberId: undefined
      },
      {
        operationId: 'op2',
        operationUserRoleLabelId: 3,
        defaultManagerTeamMemberId: undefined,
        defaultCareRepTeamMemberId: undefined
      }
    ]);
    expect(toastrStub.success).toHaveBeenCalled();
  });

  it('supports client mode transition from selected to all operations', () => {
    const component = buildComponent();

    component.ngOnInit();
    const client = component.teamAccessClients[0];
    expect(client.accessMode).toBe('selectedOperations');
    expect(client.entries.find(entry => entry.operationId === 'op2')?.operationSelected).toBe(false);

    component.setClientAccessMode(client, 'allOperations');

    expect(client.entries.every(entry => entry.operationSelected)).toBe(true);
    expect(component.isDirty).toBe(false);
  });

  it('applies bulk role with fill-unassigned semantics only', () => {
    const component = buildComponent();

    component.ngOnInit();
    const client = component.teamAccessClients[0];
    const op1 = client.entries.find(entry => entry.operationId === 'op1')!;
    const op2 = client.entries.find(entry => entry.operationId === 'op2')!;

    component.onOperationSelectedChange(client, op2, true);
    client.bulkRoleId = 3;
    component.applyBulkRole(client, false);

    expect(op1.selectedRoleId).toBe(2);
    expect(op2.selectedRoleId).toBe(3);
  });

  it('applies default assignee bulk with fill then overwrite semantics', () => {
    const component = buildComponent();

    component.ngOnInit();
    const client = component.teamAccessClients[0];
    const op1 = client.entries.find(entry => entry.operationId === 'op1')!;
    const op2 = client.entries.find(entry => entry.operationId === 'op2')!;

    component.onOperationSelectedChange(client, op2, true);
    op1.defaultManagerTeamMemberId = 'm1';
    op2.defaultManagerTeamMemberId = '';
    client.bulkManagerTeamMemberId = 'm2';

    component.applyBulkAssignee(client, 'manager', false);
    expect(op1.defaultManagerTeamMemberId).toBe('m1');
    expect(op2.defaultManagerTeamMemberId).toBe('m2');

    component.applyBulkAssignee(client, 'manager', true);
    expect(op1.defaultManagerTeamMemberId).toBe('m2');
    expect(op2.defaultManagerTeamMemberId).toBe('m2');
  });

  it('saves member override and revoke exceptions', () => {
    const component = buildComponent();

    component.ngOnInit();
    component.setActiveEditor('member');
    component.selectTeamMember('m1');
    component.memberEntries[0].selectedState = 'revoke';
    component.memberEntries[1].selectedState = 'override:3';
    component.onMemberAccessChange();
    component.saveMemberAccess();

    expect(teamServiceStub.setTeamMemberOperationAccessByTeamIdAndTeamMemberId).toHaveBeenCalledWith('t1', 'm1', [
      { operationId: 'op1', accessMode: 'revoke' },
      { operationId: 'op2', accessMode: 'override', operationUserRoleLabelId: 3 }
    ]);
    expect(toastrStub.success).toHaveBeenCalled();
  });

  it('supports admin role overrides in member exceptions', () => {
    const component = buildComponent();

    component.ngOnInit();
    component.setActiveEditor('member');
    component.selectTeamMember('m1');
    component.memberEntries[0].selectedState = 'override:1';
    component.onMemberAccessChange();
    component.saveMemberAccess();

    expect(teamServiceStub.setTeamMemberOperationAccessByTeamIdAndTeamMemberId).toHaveBeenCalledWith('t1', 'm1', [
      { operationId: 'op1', accessMode: 'override', operationUserRoleLabelId: 1 },
      { operationId: 'op2', accessMode: 'override', operationUserRoleLabelId: 3 }
    ]);
  });

  it('derives eligible assignee members from the stored team role before broader labels', () => {
    teamServiceStub.getTeamMembersByTeamId.mockReturnValueOnce(
      of([
        {
          teamMemberId: 'm1',
          userId: 'u1',
          teamMemberFirstName: 'Ada',
          teamMemberLastName: 'Lovelace',
          teamMemberRoleLabelId: 2,
          teamMemberRoleLabel: 'Manager',
          effectiveTeamMemberRoleLabelId: 1,
          effectiveTeamMemberRoleLabel: 'Admin'
        },
        {
          teamMemberId: 'm2',
          userId: 'u2',
          teamMemberFirstName: 'Grace',
          teamMemberLastName: 'Hopper',
          teamMemberRoleLabelId: 3,
          teamMemberRoleLabel: 'Care Rep',
          effectiveTeamMemberRoleLabelId: 1,
          effectiveTeamMemberRoleLabel: 'Admin'
        }
      ])
    );

    const component = buildComponent();
    component.ngOnInit();

    expect(component.roleEligibleMembers.managerEligible.map(member => member.teamMemberId)).toEqual(['m1']);
    expect(component.roleEligibleMembers.careRepEligible.map(member => member.teamMemberId).sort()).toEqual(['m1', 'm2']);
  });

  it('impersonates the selected team member from member exceptions view', async () => {
    const component = buildComponent();

    component.ngOnInit();
    component.setActiveEditor('member');
    component.selectTeamMember('m1');

    component.loginAsSelectedMember();
    await Promise.resolve();

    expect(userServiceStub.impersonateUser).toHaveBeenCalledWith('admin1', 'u1');
    expect(authServiceStub.startImpersonation).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('navigates Team Access when the sidebar selects a different team', () => {
    const component = buildComponent();
    component.ngOnInit();

    component.handleSidebarTeamChange({ teamId: 't2' } as any);

    expect(routerStub.navigate).toHaveBeenCalledWith(['/teams', 't2', 'access']);
  });
});