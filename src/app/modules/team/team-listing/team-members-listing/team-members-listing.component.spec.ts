import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TeamMembersListingComponent } from './team-members-listing.component';
import { TeamService } from '../../team.service';
import { ModalController } from '@ionic/angular';
import { UserService } from '@app/modules/user/user.service';

let teamMembersResponse: any[] = [];
let activeUsersResponse: any[] = [];

const teamServiceStub = {
  getTeamMembersByTeamId: jest.fn(() => of(teamMembersResponse.map(member => ({ ...member })))),
  addTeamMemberByTeamIdAndUserId: jest.fn((teamId: string, userId: string) => {
    if (!teamMembersResponse.some(member => member.userId === userId)) {
      const addedUser = activeUsersResponse.find(user => user.userId === userId);
      teamMembersResponse = [
        ...teamMembersResponse,
        {
          teamMemberId: 'tm-' + userId,
          teamId,
          userId,
          teamMemberFirstName: addedUser?.userFirstName || 'Added',
          teamMemberLastName: addedUser?.userLastName || 'User',
          teamMemberRoleLabelId: addedUser?.userRoleLabel === 'Admin' ? 1 : addedUser?.userRoleLabel === 'Manager' ? 2 : 3,
          teamMemberRoleLabel: addedUser?.userRoleLabel || 'Manager',
          teamMemberHired: '2026-01-01',
          spanishSpeaking: !!addedUser?.userSpeaksSpanish
        }
      ];
    }
    return of({});
  }),
  setTeamMemberRoleByTeamIdAndTeamMemberId: jest.fn((teamId: string, teamMemberId: string, teamMemberRoleLabelId: number) => {
    const nextRoleLabel = teamMemberRoleLabelId === 1 ? 'Admin' : teamMemberRoleLabelId === 2 ? 'Manager' : 'Care Rep';
    teamMembersResponse = teamMembersResponse.map(member => {
      if (member.teamId === teamId && member.teamMemberId === teamMemberId) {
        return {
          ...member,
          teamMemberRoleLabelId,
          teamMemberRoleLabel: nextRoleLabel
        };
      }

      return member;
    });

    const updatedMember = teamMembersResponse.find(member => member.teamId === teamId && member.teamMemberId === teamMemberId);
    return of({ ...updatedMember });
  }),
  removeTeamMemberByTeamIdAndTeamMemberId: jest.fn((teamId: string, teamMemberId: string) => {
    teamMembersResponse = teamMembersResponse.filter(
      member => !(member.teamId === teamId && member.teamMemberId === teamMemberId)
    );
    return of({});
  })
};

const userServiceStub = {
  getActiveUsers: jest.fn(() => of(activeUsersResponse.map(user => ({ ...user }))))
};

const modalControllerStub = {
  create: jest.fn(() => Promise.resolve({ present: jest.fn() }))
};

describe('TeamMembersListingComponent (Jest)', () => {
  let component: TeamMembersListingComponent;
  let fixture: ComponentFixture<TeamMembersListingComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    teamMembersResponse = [
      {
        teamMemberId: 'm1',
        userId: 'u-existing',
        teamId: 't1',
        teamMemberFirstName: 'Care',
        teamMemberLastName: 'Rep',
        teamMemberRoleLabelId: 3,
        teamMemberRoleLabel: 'Care Rep',
        teamMemberHired: '2026-01-01',
        spanishSpeaking: true
      }
    ];
    activeUsersResponse = [
      {
        userId: 'u-existing',
        userFirstName: 'Care',
        userLastName: 'Rep',
        userEmail: 'care@example.com',
        username: 'care.rep',
        userRoleLabel: 'Care Rep',
        userSpeaksSpanish: true
      },
      {
        userId: 'u-new',
        userFirstName: 'Manny',
        userLastName: 'Manager',
        userEmail: 'manny@example.com',
        username: 'mmanager',
        userRoleLabel: 'Manager',
        userSpeaksSpanish: false
      }
    ];

    await TestBed.configureTestingModule({
      declarations: [TeamMembersListingComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { user: { userId: 'u1' } } } } },
        { provide: TeamService, useValue: teamServiceStub },
        { provide: UserService, useValue: userServiceStub },
        { provide: ModalController, useValue: modalControllerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamMembersListingComponent);
    component = fixture.componentInstance;
    component.team = { teamId: 't1' } as any;
    component.canManageTeams = true;
    fixture.detectChanges();
  });

  it('loads team members for team', () => {
    expect(component).toBeTruthy();
    expect(component.teamMembersFiltered?.length).toBe(1);
  });

  it('opens add-member picker with active users not already on the team', () => {
    component.openAddMemberModal();

    expect(userServiceStub.getActiveUsers).toHaveBeenCalled();
    expect(component.isAddMemberModalOpen).toBe(true);
    expect(component.availableUsersFiltered.map(user => user.userId)).toEqual(['u-new']);
  });

  it('adds a selected active user to the team and refreshes the member list', () => {
    component.openAddMemberModal();

    component.addTeamMember(activeUsersResponse[1] as any);

    expect(teamServiceStub.addTeamMemberByTeamIdAndUserId).toHaveBeenCalledWith('t1', 'u-new');
    expect(component.isAddMemberModalOpen).toBe(false);
    expect(component.teamMembers.some(member => member.userId === 'u-new')).toBe(true);
  });

  it('removes an existing team member and refreshes the roster', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.removeTeamMember(teamMembersResponse[0] as any);

    expect(confirmSpy).toHaveBeenCalledWith('Remove Care Rep from this team?');
    expect(teamServiceStub.removeTeamMemberByTeamIdAndTeamMemberId).toHaveBeenCalledWith('t1', 'm1');
    expect(component.teamMembers.some(member => member.userId === 'u-existing')).toBe(false);
  });

  it('updates the selected team-specific role for a team member', () => {
    component.updateTeamMemberRole(teamMembersResponse[0] as any, 2);

    expect(teamServiceStub.setTeamMemberRoleByTeamIdAndTeamMemberId).toHaveBeenCalledWith('t1', 'm1', 2, undefined);
    expect(component.teamMembers[0].teamMemberRoleLabelId).toBe(2);
    expect(component.teamMembers[0].teamMemberRoleLabel).toBe('Manager');
  });

  it('binds the dropdown to the stored team role instead of a stronger effective role', () => {
    component.teamMembers = [
      {
        teamMemberId: 'm2',
        userId: 'u-admin-elsewhere',
        teamId: 't1',
        teamMemberFirstName: 'Casey',
        teamMemberLastName: 'Scope',
        teamMemberRoleLabelId: 2,
        teamMemberRoleLabel: 'Manager',
        effectiveTeamMemberRoleLabelId: 1,
        effectiveTeamMemberRoleLabel: 'Admin',
        teamMemberHired: '2026-01-01',
        spanishSpeaking: false
      }
    ] as any;
    component.teamMembersFiltered = component.teamMembers.slice();

    expect(component.getTeamMemberRoleValue(component.teamMembers[0] as any)).toBe(2);
  });

  it('does not default the dropdown to Admin when no stored team role exists', () => {
    component.teamMembers = [
      {
        teamMemberId: 'm3',
        userId: 'u-unassigned',
        teamId: 't1',
        teamMemberFirstName: 'No',
        teamMemberLastName: 'Role',
        teamMemberRoleLabelId: null,
        teamMemberRoleLabel: null,
        effectiveTeamMemberRoleLabelId: 1,
        effectiveTeamMemberRoleLabel: 'Admin',
        teamMemberHired: '2026-01-01',
        spanishSpeaking: false
      }
    ] as any;
    component.teamMembersFiltered = component.teamMembers.slice();
    fixture.detectChanges();

    const select: HTMLSelectElement | null = fixture.nativeElement.querySelector('.team-member-role-select');

    expect(component.getTeamMemberRoleValue(component.teamMembers[0] as any)).toBeNull();
    expect(select?.value).toBe('');
  });

  it('uses the team-scoped role label when the numeric team role id is missing', () => {
    component.teamMembers = [
      {
        teamMemberId: 'm4',
        userId: 'u-manager-scope',
        teamId: 't1',
        teamMemberFirstName: 'Scoped',
        teamMemberLastName: 'Manager',
        teamMemberRoleLabelId: null,
        teamMemberRoleLabel: 'Manager',
        effectiveTeamMemberRoleLabelId: 1,
        effectiveTeamMemberRoleLabel: 'Admin',
        teamMemberHired: '2026-01-01',
        spanishSpeaking: false
      }
    ] as any;
    component.teamMembersFiltered = component.teamMembers.slice();
    fixture.detectChanges();

    const select: HTMLSelectElement | null = fixture.nativeElement.querySelector('.team-member-role-select');

    expect(component.getTeamMemberRoleValue(component.teamMembers[0] as any)).toBe(2);
    expect(select?.value).toBe('2');
  });

  it('confirms and retries when stronger direct permissions must be removed on downgrade', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    teamServiceStub.setTeamMemberRoleByTeamIdAndTeamMemberId
      .mockImplementationOnce(() =>
        throwError(() => ({
          statusCode: 409,
          message: 'Changing this team role will remove stronger direct operation permissions for this team member.',
          directPermissionImpact: {
            affectedCount: 2,
            operations: [{ operationName: 'Operation 1' }, { operationName: 'Operation 2' }]
          }
        }))
      )
      .mockImplementationOnce((teamId: string, teamMemberId: string, teamMemberRoleLabelId: number) => {
        const nextRoleLabel = teamMemberRoleLabelId === 1 ? 'Admin' : teamMemberRoleLabelId === 2 ? 'Manager' : 'Care Rep';
        teamMembersResponse = teamMembersResponse.map(member => {
          if (member.teamId === teamId && member.teamMemberId === teamMemberId) {
            return {
              ...member,
              teamMemberRoleLabelId,
              teamMemberRoleLabel: nextRoleLabel
            };
          }

          return member;
        });

        const updatedMember = teamMembersResponse.find(member => member.teamId === teamId && member.teamMemberId === teamMemberId);
        return of({ ...updatedMember });
      });

    component.updateTeamMemberRole(teamMembersResponse[0] as any, 2);

    expect(confirmSpy).toHaveBeenCalled();
    expect(teamServiceStub.setTeamMemberRoleByTeamIdAndTeamMemberId.mock.calls[0]).toEqual(['t1', 'm1', 2, undefined]);
    expect(teamServiceStub.setTeamMemberRoleByTeamIdAndTeamMemberId.mock.calls[1]).toEqual([
      't1',
      'm1',
      2,
      { forceDirectPermissionCleanup: true }
    ]);
    expect(component.teamMembers[0].teamMemberRoleLabelId).toBe(2);
  });

  it('sends the role update when the roster select changes in the DOM', () => {
    const select: HTMLSelectElement | null = fixture.nativeElement.querySelector('.team-member-role-select');

    expect(select).toBeTruthy();

    select!.value = '2';
    select!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(teamServiceStub.setTeamMemberRoleByTeamIdAndTeamMemberId).toHaveBeenCalledWith('t1', 'm1', 2, undefined);
  });
});
