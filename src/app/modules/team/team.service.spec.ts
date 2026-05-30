import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TeamService } from './team.service';

describe('TeamService (Jest)', () => {
  const makeHttp = () => ({ get: jest.fn(() => of([] as any)), put: jest.fn(() => of([] as any)) });

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
