import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UserCorkBoardService } from './user-cork-board.service';

describe('UserCorkBoardService', () => {
  let httpMock: any;
  let imageCompressMock: any;
  let service: UserCorkBoardService;

  beforeEach(() => {
    httpMock = {
      post: jest.fn(),
      delete: jest.fn(),
      get: jest.fn()
    };
    imageCompressMock = {
      uploadFile: jest.fn(),
      compressFile: jest.fn()
    };
    service = new UserCorkBoardService(httpMock, imageCompressMock);
  });

  it('posts a cork board file for a user', done => {
    const mockFile = new File(['abc'], 'note.txt', { type: 'text/plain' });
    httpMock.post.mockReturnValue(of('ok'));

    service.addNewUserCorkBoardObjectByUserId('123', mockFile).subscribe(value => {
      expect(value).toBe('ok');
      expect(httpMock.post).toHaveBeenCalledWith('users/123/corkBoardObjects', expect.any(FormData));
      done();
    });
  });

  it('handles backend errors when posting cork board file', done => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    httpMock.post.mockReturnValue(throwError(new HttpErrorResponse({ status: 500, error: 'fail' })));

    service.addNewUserCorkBoardObjectByUserId('123', new File(['a'], 'a.txt')).subscribe({
      error: message => {
        expect(consoleSpy).toHaveBeenCalled();
        expect(message).toContain('user cork board service');
        consoleSpy.mockRestore();
        done();
      }
    });
  });

  it('converts base64 data to a jpeg blob', () => {
    const blob = service.dataURItoBlob('YWFh');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('toggles corkboard state and emits changes', () => {
    const states: boolean[] = [];
    service.menuStateBSubject.subscribe(value => states.push(value));

    service.toggleCorkboardState();
    service.toggleCorkboardState();

    expect(states.slice(-2)).toEqual([true, false]);
  });

  it('marks refresh and notifies subscribers', () => {
    const refreshes: boolean[] = [];
    service.refreshUserCorkBoardBSubject.subscribe(flag => refreshes.push(flag));

    service.userCorkBoardUpdated();

    expect(service.refresh).toBe(true);
    expect(refreshes[refreshes.length - 1]).toBe(true);
  });

  it('compresses and uploads a file when doing upload', async () => {
    const uploadResult = { image: 'data:image/jpeg;base64,AAAA' };
    imageCompressMock.uploadFile.mockResolvedValue(uploadResult);
    imageCompressMock.compressFile.mockResolvedValue('data:image/jpeg;base64,BBBB');
    const addSpy = jest
      .spyOn(service, 'addNewUserCorkBoardObjectByUserId')
      .mockReturnValue({ toPromise: jest.fn().mockResolvedValue(null) } as any);

    const user = { userId: 'u-1' } as any;
    await service.doUpload(user);

    expect(imageCompressMock.uploadFile).toHaveBeenCalled();
    expect(imageCompressMock.compressFile).toHaveBeenCalledWith(uploadResult.image, 1, 50, 50);
    expect(addSpy).toHaveBeenCalledWith('u-1', expect.any(File));
    expect(service.imgResultAfterCompress).toContain('BBBB');
  });

  it('handles client-side errors in handleAsyncError', done => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorEvent = new HttpErrorResponse({
      error: new ErrorEvent('Network', { message: 'offline' }),
      status: 0
    });

    (service as any).handleAsyncError(errorEvent).subscribe({
      error: message => {
        expect(consoleSpy).toHaveBeenCalledWith('An error occurred:', 'offline');
        expect(message).toContain('user cork board service');
        consoleSpy.mockRestore();
        done();
      }
    });
  });
});
