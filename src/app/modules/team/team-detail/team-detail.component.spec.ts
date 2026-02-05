import { of } from 'rxjs';

import { TeamMemberDetailComponent } from './team-detail.component';
import { TeamService } from '../team.service';
import { UserService } from '@app/modules/user/user.service';
import { SharedFunctions } from '@app/shared/shared.functions';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

const teamServiceStub = {
  getTeamMemberByTeamIdAndTeamMemberId: jest.fn(() =>
    of({ teamId: 't1', teamMemberId: 'm1', userId: 'u1', teamMemberRoleLabel: 'Manager' })
  )
};

const userServiceStub = {
  getUserByUserId: jest.fn(() =>
    of({
      userId: 'u1',
      userAdditionalInfo: '<p>info</p>',
      userInterests: JSON.stringify({ celebrity: true })
    })
  )
};

const modalControllerStub = {
  create: jest.fn(() => Promise.resolve({ present: jest.fn() }))
};

const activatedRouteStub: Partial<ActivatedRoute> = {
  snapshot: { params: { teamId: 't1', teamMemberId: 'm1' } } as any,
  paramMap: of({ get: (key: string) => (key === 'teamId' ? 't1' : 'm1') }) as any
};

describe('TeamMemberDetailComponent (Jest)', () => {
  const buildComponent = () =>
    new TeamMemberDetailComponent(
      modalControllerStub as any,
      activatedRouteStub as ActivatedRoute,
      (teamServiceStub as unknown) as TeamService,
      (userServiceStub as unknown) as UserService,
      ({ returnHTML: jest.fn((html: string) => html) } as unknown) as SharedFunctions
    );

  it('loads team member details', () => {
    const component = buildComponent();
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.teamMember?.teamMemberId).toBe('m1');
    expect(component.user?.userInterests[0].nicename).toContain('Met favorite celebrity');
  });

  it('opens post it modal via helper', async () => {
    const component = buildComponent();
    component.user = { userId: 'u1' } as any;
    component.teamMember = { userId: 'u1', teamMemberId: 'm1' } as any;
    await component.postNote();
    expect(modalControllerStub.create).toHaveBeenCalled();
  });
});
