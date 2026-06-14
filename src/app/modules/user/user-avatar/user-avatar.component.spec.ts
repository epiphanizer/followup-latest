import { of } from 'rxjs';
import { SimpleChange } from '@angular/core';

import { UserAvatarComponent } from './user-avatar.component';
import { UserAvatarService } from './user-avatar.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';

const userAvatarServiceStub = {
  getUserAvatarByUserId: jest.fn(() => of(null)),
  uploadUserAvatarByUserId: jest.fn(() => of(null))
};

const imageCompressStub = {
  uploadFile: jest.fn(),
  compressFile: jest.fn()
};

const toastrStub = {
  success: jest.fn()
};

const sanitizerStub = ({
  bypassSecurityTrustStyle: jest.fn(style => style)
} as unknown) as DomSanitizer;

const routerStub = {
  url: '/team/123'
};

describe('UserAvatarComponent (Jest)', () => {
  const buildComponent = () =>
    new UserAvatarComponent(
      imageCompressStub as any,
      routerStub as any,
      sanitizerStub,
      toastrStub as any,
      userAvatarServiceStub as any
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates component and checks avatar existence', () => {
    const component = buildComponent();
    component.user = { userId: 'u1' } as any;
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.avatarExists).toBe(false);
  });

  it('does not request an avatar when no user is available yet', () => {
    const component = buildComponent();

    component.user = undefined as any;
    component.ngOnInit();

    expect(userAvatarServiceStub.getUserAvatarByUserId).not.toHaveBeenCalled();
  });

  it('loads the avatar when the user input arrives after init', () => {
    const component = buildComponent();

    component.user = undefined as any;
    component.ngOnInit();
    component.user = { userId: 'u2' } as any;
    component.ngOnChanges({
      user: new SimpleChange(undefined, component.user, false)
    });

    expect(userAvatarServiceStub.getUserAvatarByUserId).toHaveBeenCalledWith('u2');
  });
});
