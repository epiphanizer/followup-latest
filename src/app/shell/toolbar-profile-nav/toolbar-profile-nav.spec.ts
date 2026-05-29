import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ToolbarProfileNavComponent } from './toolbar-profile-nav.component';
import { AuthenticationService } from '@app/core';
import { UserAvatarService } from '@app/modules/user/user-avatar/user-avatar.service';

describe('ToolbarLogoComponent', () => {
  let component: ToolbarProfileNavComponent;
  let fixture: ComponentFixture<ToolbarProfileNavComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [ToolbarProfileNavComponent],
        providers: [
          { provide: AuthenticationService, useValue: { signOut: jest.fn() } },
          { provide: UserAvatarService, useValue: { getUserAvatarByUserId: jest.fn(() => of(null)) } }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarProfileNavComponent);
    component = fixture.componentInstance;
    component.user = { userId: 'u1', avatarData: new Blob() } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
