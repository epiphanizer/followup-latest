import { of } from 'rxjs';

import { TeamListingSidebar } from './team-listing-sidebar.component';
import { TeamService } from '../../team.service';
import { LogService } from '@app/shared/log/log.service';

let teamsResponse: any[] = [];
let teamMembersResponseByTeamId: { [teamId: string]: any[] } = {};

const logServiceStub = {
  log: jest.fn()
};

const teamServiceStub = {
  getTeams: jest.fn(() => of(teamsResponse.map((team: any) => ({ ...team })))),
  getTeamMembersByTeamId: jest.fn((teamId: string) => of((teamMembersResponseByTeamId[teamId] || []).map(member => ({ ...member })))),
  addTeam: jest.fn(() => of({ teamId: 't-new', teamName: 'New Team', teamActive: 1 })),
  editTeamByTeamId: jest.fn((teamId: string, payload: { teamName: string; teamActive?: number }) => {
    teamsResponse = teamsResponse.map((team: any) =>
      team.teamId === teamId
        ? {
            ...team,
            teamName: payload.teamName,
            teamActive: payload.teamActive === 0 ? 0 : 1
          }
        : team
    );
    return of({});
  }),
  deactivateTeamByTeamId: jest.fn(() => of({}))
};

describe('TeamListingSidebar (Jest)', () => {
  const buildComponent = () => new TeamListingSidebar(logServiceStub as any, teamServiceStub as any);

  beforeEach(() => {
    jest.clearAllMocks();
    teamsResponse = [
      {
        teamId: 't1',
        teamName: 'Team One',
        teamActive: 1
      },
      {
        teamId: 't2',
        teamName: 'Archived Team',
        teamActive: 0
      }
    ];
    teamMembersResponseByTeamId = {
      t1: [
        { teamMemberId: 'm1', teamMemberRoleLabel: 'Manager', spanishSpeaking: true },
        { teamMemberId: 'm2', teamMemberRoleLabel: 'Care Rep', spanishSpeaking: false }
      ],
      t2: []
    };
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

  it('restores an archived team and returns the sidebar to active view', () => {
    const component = buildComponent();
    component.canManageTeams = true;
    component.ngOnInit();
    component.teamVisibilityFilter = 'archived';
    const emitSpy = jest.spyOn(component.teamChangeEvent, 'emit');
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const archivedTeam = component.teams.find((team: any) => team.teamId === 't2') as any;

    component.restoreTeam(
      archivedTeam,
      {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      } as any
    );

    expect(confirmSpy).toHaveBeenCalledWith('Restore this archived team?');
    expect(teamServiceStub.editTeamByTeamId).toHaveBeenCalledWith('t2', {
      teamName: 'Archived Team',
      teamActive: 1
    });
    expect(component.teamVisibilityFilter).toBe('active');
    expect(component.selectedTeamId).toBe('t2');
    expect(component.visibleTeams.some((team: any) => team.teamId === 't2')).toBe(true);
    expect(emitSpy).toHaveBeenCalled();
  });
});
