import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TeamService } from './team.service';

describe('TeamService (Jest)', () => {
  const makeHttp = () => ({
    get: jest.fn(() => of([] as any)),
    put: jest.fn(() => of([] as any)),
    post: jest.fn(() => of({} as any)),
    delete: jest.fn(() => of({} as any))
  });

  it('gets team member and members lists', done => {
    const http = makeHttp();
    const svc = new TeamService(http as any);

    svc.getTeamMemberByTeamIdAndTeamMemberId('t1', 'm1').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams/t1/members/m1');
    });
    svc.getTeamMembersByTeamId('t1').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams/t1/members/');
      done();
    });
  });

  it('gets team messages and totals', done => {
    const http = makeHttp();
    const svc = new TeamService(http as any);

    svc.getTeamMessagesByTeamId('t2').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams/t2/messages/');
    });
    svc.getTeams().subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams');
    });
    svc.getTeamTotals().subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams/totals');
      done();
    });
  });

  it('creates, edits, and archives teams', done => {
    const http = makeHttp();
    const svc = new TeamService(http as any);

    svc.addTeam('New Team').subscribe(() => {
      expect(http.post).toHaveBeenCalledWith('teams', {
        teamName: 'New Team',
        teamActive: 1
      });
    });

    svc.editTeamByTeamId('t2', { teamName: 'Renamed Team', teamActive: 1 }).subscribe(() => {
      expect(http.put).toHaveBeenCalledWith('teams/t2', { teamName: 'Renamed Team', teamActive: 1 });
    });

    svc.deactivateTeamByTeamId('t2', { teamName: 'Renamed Team', cascadePermissions: true }).subscribe(() => {
      expect(http.delete).toHaveBeenCalledWith('teams/t2', {
        body: { teamName: 'Renamed Team', cascadePermissions: true }
      });
      done();
    });
  });

  it('gets and sets team operation assignments', done => {
    const http = makeHttp();
    const svc = new TeamService(http as any);

    svc.getTeamOperationAssignmentsByTeamId('t1').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams/t1/operations');
    });

    svc
      .setTeamOperationAssignmentsByTeamId('t1', [{ operationId: 'op1', operationUserRoleLabelId: 2 }])
      .subscribe(() => {
        expect(http.put).toHaveBeenCalledWith('teams/t1/operations', {
          assignments: [{ operationId: 'op1', operationUserRoleLabelId: 2 }]
        });
        done();
      });
  });

  it('gets and sets team member operation access exceptions', done => {
    const http = makeHttp();
    const svc = new TeamService(http as any);

    svc.getTeamMemberOperationAccessByTeamIdAndTeamMemberId('t1', 'm1').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('teams/t1/members/m1/operations');
    });

    svc
      .setTeamMemberOperationAccessByTeamIdAndTeamMemberId('t1', 'm1', [
        { operationId: 'op1', accessMode: 'override', operationUserRoleLabelId: 3 },
        { operationId: 'op2', accessMode: 'revoke' }
      ])
      .subscribe(() => {
        expect(http.put).toHaveBeenCalledWith('teams/t1/members/m1/operations', {
          assignments: [
            { operationId: 'op1', accessMode: 'override', operationUserRoleLabelId: 3 },
            { operationId: 'op2', accessMode: 'revoke' }
          ]
        });
        done();
      });
  });

  it('handles errors', done => {
    const http = { get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' }))) } as any;
    const svc = new TeamService(http as any);

    svc.getTeams().subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });
});
