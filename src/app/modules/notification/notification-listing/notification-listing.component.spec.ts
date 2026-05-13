import { of } from 'rxjs';
import { NotificationListingComponent } from './notification-listing.component';

const baseUser = {
  operationGroups: [{ operations: [{ operationId: 'op-1' }] }]
} as any;

describe('NotificationListingComponent (Jest)', () => {
  it('initializes selected operation from user when none provided', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const notificationService = { getNotificationsByOperationId: jest.fn() } as any;
    const comp = new NotificationListingComponent(notificationService as any, route);

    comp.ngOnInit();

    expect(comp.selected.operation.operationId).toBe('op-1');
  });

  it('falls back to first available operation when first group is empty', () => {
    const route = {
      snapshot: {
        data: {
          user: {
            operationGroups: [{ operations: [] }, { operations: [{ operationId: 'op-2' }] }]
          }
        }
      }
    } as any;
    const notificationService = { getNotificationsByOperationId: jest.fn() } as any;
    const comp = new NotificationListingComponent(notificationService as any, route);

    comp.ngOnInit();

    expect(comp.selected.operation.operationId).toBe('op-2');
  });

  it('fetches notifications on operation change', done => {
    const route = { snapshot: { data: { operation: { operationId: 'op-2' } } } } as any;
    const notificationService = {
      getNotificationsByOperationId: jest.fn(() => of([{ id: 'n1' } as any]))
    } as any;
    const comp = new NotificationListingComponent(notificationService as any, route);
    comp.ngOnInit();

    comp.operationChangeEventHandler({ operationId: 'op-2' } as any);

    expect(notificationService.getNotificationsByOperationId).toHaveBeenCalledWith('op-2');
    const notifications$ = comp.notifications$ as any;
    expect(notifications$).toBeTruthy();
    notifications$.subscribe((result: any) => {
      expect(result).toEqual([{ id: 'n1' } as any]);
      expect(comp.notifications).toEqual([{ id: 'n1' } as any]);
      done();
    });
  });

  it('honors provided operation on init', () => {
    const route = { snapshot: { data: { operation: { operationId: 'op-x' } } } } as any;
    const notificationService = { getNotificationsByOperationId: jest.fn() } as any;
    const comp = new NotificationListingComponent(notificationService as any, route);

    comp.ngOnInit();

    expect(comp.selected.operation.operationId).toBe('op-x');
  });

  it('updates filter date from child event', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const notificationService = { getNotificationsByOperationId: jest.fn() } as any;
    const comp = new NotificationListingComponent(notificationService as any, route);

    comp.ngOnInit();
    comp.handleDateFilterChangeEvent('2020-10-10');

    expect(comp.selected.filterDate).toBe('2020-10-10');
  });
});
