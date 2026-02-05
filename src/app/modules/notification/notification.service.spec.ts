import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService (Jest)', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds notification', () => {
    const notification = {
      notificationCreatedByUserId: 'u1',
      notificationTypeId: 't1',
      notificationOperationId: 'op1',
      notificationMessage: 'msg',
      notificationPatientId: 'p1'
    } as any;

    service.addNotificationByOperationIdAndNotificationTypeId(notification).subscribe(resp => {
      expect(resp).toEqual({ ok: true } as any);
    });

    const req = httpMock.expectOne('notifications');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject(notification);
    req.flush({ ok: true });
  });

  it('gets notification by id', () => {
    service.getNotificationByNotificationId('n1').subscribe(resp => {
      expect(resp).toEqual({ id: 'n1' } as any);
    });

    const req = httpMock.expectOne('notification/n1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'n1' });
  });

  it('gets notifications by operation id', () => {
    service.getNotificationsByOperationId('op2').subscribe(resp => {
      expect(resp).toEqual([{ id: 'n2' } as any]);
    });

    const req = httpMock.expectOne('notifications/operations/op2');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'n2' }]);
  });

  it('gets notifications by patient id', () => {
    service.getNotificationsByPatientId('p9').subscribe(resp => {
      expect(resp).toEqual([{ id: 'n3' } as any]);
    });

    const req = httpMock.expectOne('notifications/patient/p9');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'n3' }]);
  });

  it('gets notification recipients', () => {
    service.getNotificationRecipientsByOperationIdAndNotificationTypeId('op3', 't9').subscribe(resp => {
      expect(resp).toEqual([{ id: 'r1' } as any]);
    });

    const req = httpMock.expectOne('operations/op3/notifications/t9/recipients');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'r1' }]);
  });

  it('gets notification types', () => {
    service.getNotificationTypes().subscribe(resp => {
      expect(resp).toEqual([{ id: 't1' } as any]);
    });

    const req = httpMock.expectOne('notifications/types');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 't1' }]);
  });

  it('saves notification by patient id', () => {
    service.saveNotificationByPatientId('p2').subscribe(resp => {
      expect(resp).toEqual({ ok: true } as any);
    });

    const req = httpMock.expectOne('notifications/operations/p2');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ ok: true });
  });

  it('sends notification by id', () => {
    service.sendNotificationByNotificationId('n-send').subscribe(resp => {
      expect(resp).toEqual({ ok: true } as any);
    });

    const req = httpMock.expectOne('notifications/send');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ notificationId: 'n-send' });
    req.flush({ ok: true });
  });
});
