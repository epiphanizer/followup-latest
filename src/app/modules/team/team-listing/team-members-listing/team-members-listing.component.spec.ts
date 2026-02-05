import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TeamMembersListingComponent } from './team-members-listing.component';
import { TeamService } from '../../team.service';
import { ModalController } from '@ionic/angular';

const teamServiceStub = {
  getTeamMembersByTeamId: jest.fn(() =>
    of([{ teamMemberId: 'm1', teamMemberFirstName: 'Care', teamMemberLastName: 'Rep', spanishSpeaking: true }])
  )
};

const modalControllerStub = {
  create: jest.fn(() => Promise.resolve({ present: jest.fn() }))
};

describe('TeamMembersListingComponent (Jest)', () => {
  let component: TeamMembersListingComponent;
  let fixture: ComponentFixture<TeamMembersListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamMembersListingComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { user: { userId: 'u1' } } } } },
        { provide: TeamService, useValue: teamServiceStub },
        { provide: ModalController, useValue: modalControllerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamMembersListingComponent);
    component = fixture.componentInstance;
    component.team = { teamId: 't1' } as any;
    fixture.detectChanges();
  });

  it('loads team members for team', () => {
    expect(component).toBeTruthy();
    expect(component.teamMembersFiltered?.length).toBe(1);
  });
});
