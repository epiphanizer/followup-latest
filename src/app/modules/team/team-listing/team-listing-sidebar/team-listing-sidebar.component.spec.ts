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
        teamName: 'Team One',
        teamActive: 1
      }
    ])
  ),
  getTeamMembersByTeamId: jest.fn(() =>
    of([
      { teamMemberId: 'm1', teamMemberRoleLabel: 'Manager', spanishSpeaking: true },
      { teamMemberId: 'm2', teamMemberRoleLabel: 'Care Rep', spanishSpeaking: false }
    ])
  ),
  addTeam: jest.fn(() => of({ teamId: 't-new', teamName: 'New Team', teamActive: 1 })),
  editTeamByTeamId: jest.fn(() => of({})),
  deactivateTeamByTeamId: jest.fn(() => of({}))
};

describe('TeamListingSidebar (Jest)', () => {
  const buildComponent = () => new TeamListingSidebar(logServiceStub as any, teamServiceStub as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads teams and emits initial selection', () => {
    const component = buildComponent();
    const emitSpy = jest.spyOn(component.teamChangeEvent, 'emit');
    component.team = { teamId: 't1' } as any;
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(component.teams?.length).toBeGreaterThan(0);
    expect(component.getTeamMemberCount(component.teams[0] as any)).toBe(2);
    expect(component.getRoleGroupCount(component.teams[0] as any, 'managers')).toBe(1);
    expect(component.roleGroupKeys).toEqual(['admins', 'managers', 'careReps']);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('toggles role-group expansion for selected team', () => {
    const component = buildComponent();
    component.team = { teamId: 't1' } as any;
    component.ngOnInit();

    const team = component.teams[0] as any;
    expect(component.isRoleGroupExpanded(team, 'managers')).toBe(true);

    component.toggleRoleGroup(team, 'managers');

    expect(component.isRoleGroupExpanded(team, 'managers')).toBe(false);
  });

  it('creates a team after prompt confirmation', () => {
    const component = buildComponent();
    component.canManageTeams = true;
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('  New Team  ');

    component.createTeam();

    expect(promptSpy).toHaveBeenCalledWith('New team name');
    expect(teamServiceStub.addTeam).toHaveBeenCalledWith('New Team');
  });
});
