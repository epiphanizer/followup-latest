import { of } from 'rxjs';
import { UserAvatarService } from './user-avatar.service';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

describe('UserAvatarService', () => {
  it('loads avatars without blocking the global loader', () => {
    const http = {
      get: jest.fn((_url: string, _options: any) => of(new Blob()))
    };
    const service = new UserAvatarService(http as any, {} as any);

    service.getUserAvatarByUserId('42').subscribe();

    expect(http.get).toHaveBeenCalledWith(
      'users/42/avatar',
      expect.objectContaining({ responseType: 'blob' })
    );
    const requestOptions = http.get.mock.calls[0][1];
    expect(requestOptions.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
  });
});
