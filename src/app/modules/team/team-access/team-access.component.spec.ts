import { of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { OperationService } from '@app/modules/operation/operation.service';
import { TeamAccessComponent } from './team-access.component';
import { TeamService } from '../team.service';

const teamServiceStub = {
  getTeams: jest.fn(() => of([{ teamId: 't1', teamName: 'Team One' }])),
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
    expect(component.groupedEntries.length).toBe(1);
    expect(component.groupedEntries[0].entries[0].selectedRoleId).toBe(2);
  });

  it('saves desired-state assignments', () => {
    const component = buildComponent();

    component.ngOnInit();
    component.entries[1].selectedRoleId = 3;
    component.onRoleChange();
    component.saveAssignments();

    expect(teamServiceStub.setTeamOperationAssignmentsByTeamId).toHaveBeenCalledWith('t1', [
      { operationId: 'op1', operationUserRoleLabelId: 2 },
      { operationId: 'op2', operationUserRoleLabelId: 3 }
    ]);
    expect(toastrStub.success).toHaveBeenCalled();
  });
});