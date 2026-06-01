import { of } from 'rxjs';

import { TeamListingSidebar } from './team-listing-sidebar.component';
import { TeamService } from '../../team.service';
import { LogService } from '@app/shared/log/log.service';

const logServiceStub = {
  log: jest.fn()
};

const teamServiceStub = {
  getTeams: jest.fn(() =>
    of([
      {
        teamId: 't1',
        teamName: 'Team One'
      }
    ])
  ),
  getTeamMembersByTeamId: jest.fn(() =>
    of([
      { teamMemberId: 'm1', teamMemberRoleLabel: 'Manager', spanishSpeaking: true },
      { teamMemberId: 'm2', teamMemberRoleLabel: 'Care Rep', spanishSpeaking: false }
    ])
  )
};

describe('TeamListingSidebar (Jest)', () => {
  const buildComponent = () => new TeamListingSidebar(logServiceStub as any, teamServiceStub as any);

  it('loads teams and emits initial selection', () => {
    const component = buildComponent();
    const emitSpy = jest.spyOn(component.teamChangeEvent, 'emit');
    component.team = { teamId: 't1' } as any;
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.teams?.length).toBeGreaterThan(0);
    expect(component.getTeamMemberCount(component.teams[0] as any)).toBe(2);
    expect(emitSpy).toHaveBeenCalled();
  });
});
