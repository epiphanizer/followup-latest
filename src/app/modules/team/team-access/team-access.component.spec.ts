import { of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { OperationService } from '@app/modules/operation/operation.service';
import { TeamAccessComponent } from './team-access.component';
import { TeamService } from '../team.service';

const teamServiceStub = {
  getTeams: jest.fn(() => of([{ teamId: 't1', teamName: 'Team One' }])),
  getTeamMembersByTeamId: jest.fn(() =>
    of([
      { teamMemberId: 'm1', teamMemberFirstName: 'Ada', teamMemberLastName: 'Lovelace' },
      { teamMemberId: 'm2', teamMemberFirstName: 'Grace', teamMemberLastName: 'Hopper' }
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
  snapshot: { params: { teamId: 't1' } } as any,
  paramMap: of({ get: (key: string) => (key === 'teamId' ? 't1' : null) }) as any
};

const toastrStub = {
  success: jest.fn(),
  error: jest.fn()
};

describe('TeamAccessComponent (Jest)', () => {
  const buildComponent = () =>
    new TeamAccessComponent(
      activatedRouteStub as ActivatedRoute,
      teamServiceStub as unknown as TeamService,
      operationServiceStub as unknown as OperationService,
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
      { operationId: 'op1', operationUserRoleLabelId: 2 },
      { operationId: 'op2', operationUserRoleLabelId: 3 }
    ]);
    expect(toastrStub.success).toHaveBeenCalled();
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
});