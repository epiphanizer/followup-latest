import { of } from 'rxjs';
import { NotificationResolver } from './notification-resolver.service';

describe('NotificationResolver (Jest)', () => {
  it('resolves notification by id', async () => {
    const route = { paramMap: { get: jest.fn(() => 'n1') } } as any;
    const notificationService = {
      getNotificationByNotificationId: jest.fn(() => of([{ id: 'n1' } as any]))
    } as any;
    const resolver = new NotificationResolver(notificationService as any);

    const result = await resolver.resolve(route).toPromise();

    expect(notificationService.getNotificationByNotificationId).toHaveBeenCalledWith('n1');
    expect(result).toEqual({ id: 'n1' });
  });
});
