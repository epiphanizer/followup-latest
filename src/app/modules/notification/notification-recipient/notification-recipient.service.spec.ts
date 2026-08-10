import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationRecipientService } from './notification-recipient.service';

describe('NotificationRecipientService (Jest)', () => {
  let service: NotificationRecipientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationRecipientService]
    });

    service = TestBed.inject(NotificationRecipientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds notification recipient', () => {
    const body = { foo: 'bar' } as any;

    service.addNotificationRecipientByOperationContactId(body).subscribe(resp => {
      expect(resp).toEqual({ ok: true } as any);
    });

    const req = httpMock.expectOne('notifications/recipients/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(body);
    req.flush({ ok: true });
  });

  it('gets notification recipient by contact id', () => {
    service.getNotificationRecipientByOperationContactId('oc-1').subscribe(resp => {
      expect(resp).toEqual([{ id: 'r1' } as any]);
    });

    const req = httpMock.expectOne(request => {
      return request.url === 'notifications/contacts/oc-1' && request.params.has('_');
    });
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'r1' }]);
  });
});
