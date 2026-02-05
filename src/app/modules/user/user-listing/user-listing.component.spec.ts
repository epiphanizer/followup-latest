import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserListingComponent } from './user-listing.component';

describe('UserListingComponent (Jest)', () => {
  let component: UserListingComponent;
  let fixture: ComponentFixture<UserListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListingComponent],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { data: { user: { userId: 'u1' } } } } }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
    expect(component.user.userId).toBe('u1');
  });
});
