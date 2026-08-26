import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PatientAvatarService } from './patient-avatar.service';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

describe('PatientAvatarService (Jest)', () => {
  it('fetches patient avatar', done => {
    const http = { get: jest.fn(() => of('blob' as any)) } as any;
    const svc = new PatientAvatarService(http as any);

    svc.getPatientAvatarByPatientId('p1').subscribe((result: any) => {
      expect(result).toBe('blob');
      expect(http.get).toHaveBeenCalledWith(
        'patients/p1/avatar',
        expect.objectContaining({ responseType: 'blob' })
      );
      expect(http.get.mock.calls[0][1].context.get(SKIP_GLOBAL_LOADER)).toBe(true);
      done();
    });
  });

  it('uploads patient avatar', done => {
    const http = { post: jest.fn(() => of({ uploaded: true } as any)) } as any;
    const svc = new PatientAvatarService(http as any);
    const file = new File(['x'], 'avatar.png');

    svc.uploadPatientAvatarByPatientId('p2', file).subscribe((result: any) => {
      expect(result).toEqual({ uploaded: true });
      expect(http.post).toHaveBeenCalled();
      done();
    });
  });

  it('clears cached avatar reads after upload so the next fetch is fresh', done => {
    const http = {
      get: jest.fn(() => of('blob' as any)),
      post: jest.fn(() => of({ uploaded: true } as any))
    } as any;
    const svc = new PatientAvatarService(http as any);
    const file = new File(['x'], 'avatar.png');

    svc.getPatientAvatarByPatientId('p4').subscribe({
      next: () => {
        svc.getPatientAvatarByPatientId('p4').subscribe({
          next: () => {
            expect(http.get).toHaveBeenCalledTimes(1);

            svc.uploadPatientAvatarByPatientId('p4', file).subscribe({
              next: () => {
                svc.getPatientAvatarByPatientId('p4').subscribe({
                  next: () => {
                    expect(http.get).toHaveBeenCalledTimes(2);
                    done();
                  },
                  error: done.fail
                });
              },
              error: done.fail
            });
          },
          error: done.fail
        });
      },
      error: done.fail
    });
  });

  it('handles errors', done => {
    const http = { get: jest.fn(() => throwError(new HttpErrorResponse({ status: 500, error: 'fail' }))) } as any;
    const svc = new PatientAvatarService(http as any);

    svc.getPatientAvatarByPatientId('p3').subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err.status).toBe(500);
        done();
      }
    });
  });
});
