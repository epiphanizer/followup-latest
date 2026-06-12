import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

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
          teamMemberRoleLabel: addedUser?.userRoleLabel || 'Manager',
          teamMemberHired: '2026-01-01',
          spanishSpeaking: !!addedUser?.userSpeaksSpanish
        }
      ];
    }
    return of({});
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
    teamMembersResponse = [
      {
        teamMemberId: 'm1',
        userId: 'u-existing',
        teamId: 't1',
        teamMemberFirstName: 'Care',
        teamMemberLastName: 'Rep',
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
});
