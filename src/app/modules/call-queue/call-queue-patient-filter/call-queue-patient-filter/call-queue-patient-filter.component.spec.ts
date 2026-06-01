import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { CallQueuePatientFilterComponent } from './call-queue-patient-filter.component';

const makePatientCallService = (calls: any[]) => ({
  getSpanishSpeakingPatientCalls: jest.fn(() => of(calls)),
  getPatientCallsByOperationId: jest.fn(() => of(calls))
});

describe('CallQueuePatientFilterComponent (Jest)', () => {
  it('filters calls by selected date', async () => {
    const calls = [
      { patientCallScheduledTime: '2020-01-02T12:00:00' },
      { patientCallEndTime: '2020-01-03T12:00:00' }
    ] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.mode = { spanish: true };
    comp.filterDate = '2020-01-02T12:00:00';

    comp.ngOnInit();
    await Promise.resolve();

    expect(svc.getSpanishSpeakingPatientCalls).toHaveBeenCalled();
    expect(comp.patientCallsFiltered.length).toBe(1);
    expect(comp.patientCallsFiltered[0]).toEqual(calls[0]);
  });

  it('loads operation calls on init when not spanish', async () => {
    const calls = [
      { patientCallScheduledTime: '2020-01-01T10:00:00' },
      { patientCallEndTime: '2020-02-01T10:00:00' }
    ] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.mode = { spanish: false };
    comp.operation = { operationId: 'op-1' } as any;
    comp.filterDate = '2020-01-01T10:00:00';

    comp.ngOnInit();
    await Promise.resolve();

    expect(svc.getPatientCallsByOperationId).toHaveBeenCalledWith('op-1');
    expect(comp.patientCallsFiltered.length).toBe(1);
    expect(comp.patientCallsFiltered[0]).toEqual(calls[0]);
  });

  it('falls back to spanish calls when no operation provided', async () => {
    const calls = [
      { patientCallScheduledTime: '2020-03-01T12:00:00' },
      { patientCallEndTime: '2020-04-01T12:00:00' }
    ] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.mode = { spanish: false };
    comp.filterDate = '2020-03-01T12:00:00';

    comp.ngOnInit();
    await Promise.resolve();

    expect(svc.getSpanishSpeakingPatientCalls).toHaveBeenCalled();
    expect(comp.patientCallsFiltered.length).toBe(1);
    expect(comp.patientCallsFiltered[0]).toEqual(calls[0]);
  });

  it('filters calls by text search', () => {
    const calls = [
      { patientFirstName: 'Jane', patientLastName: 'Doe' },
      { patientFirstName: 'John', patientLastName: 'Smith' }
    ] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.patientCalls = calls;

    const filtered = comp.searchPatientCallHistoryByText({ currentTarget: { value: 'jane' } } as any);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].patientFirstName).toBe('Jane');
  });

  it('re-filters when filterDate changes', () => {
    const calls = [{ patientCallScheduledTime: '2020-05-01T00:00:00' }] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.patientCalls = calls;
    comp.searchPatientCallHistoryBySelectedDate = jest.fn();

    comp.ngOnChanges({
      filterDate: {
        currentValue: '2020-05-01',
        previousValue: '2020-04-01',
        firstChange: false,
        isFirstChange: () => false
      } as any
    });

    expect(comp.filterDate).toBe('2020-05-01');
    expect(comp.searchPatientCallHistoryBySelectedDate).toHaveBeenCalledWith('2020-05-01');
  });

  it('loads calls when operation changes', async () => {
    const calls = [{ patientCallScheduledTime: '2020-06-01T12:00:00' }] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.operation = { operationId: 'op-2' } as any;
    comp.filterDate = '2020-06-01T12:00:00';

    comp.ngOnChanges({
      operation: {
        currentValue: { operationId: 'op-2' },
        previousValue: { operationId: 'op-0' },
        firstChange: false,
        isFirstChange: () => false
      } as any
    });
    await Promise.resolve();

    expect(svc.getPatientCallsByOperationId).toHaveBeenCalledWith('op-2');
    expect(comp.patientCallsFiltered.length).toBe(1);
    expect(comp.patientCallsFiltered[0]).toEqual(calls[0]);
  });

  it('does not double-load operation calls across first change and init', async () => {
    const calls = [{ patientCallScheduledTime: '2020-06-01T12:00:00' }] as any;
    const svc = makePatientCallService(calls);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.mode = { spanish: false };
    comp.operation = { operationId: 'op-init' } as any;
    comp.filterDate = '2020-06-01T12:00:00';

    comp.ngOnChanges({
      operation: {
        currentValue: { operationId: 'op-init' },
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      } as any
    });
    comp.ngOnInit();
    await Promise.resolve();

    expect(svc.getPatientCallsByOperationId).toHaveBeenCalledTimes(1);
    expect(svc.getPatientCallsByOperationId).toHaveBeenCalledWith('op-init');
  });

  it('builds patient call link with patient operation id when present', () => {
    const svc = makePatientCallService([]);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));

    const link = comp.getPatientCallLink({ patientId: 'p-1', patientOperationId: 'op-1' } as any);

    expect(link).toBe('/call-queue/operations/op-1/patient/p-1');
  });

  it('falls back to selected operation id when call payload has no operation id', () => {
    const svc = makePatientCallService([]);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));
    comp.operation = { operationId: 'op-fallback' } as any;

    const link = comp.getPatientCallLink({ patientId: 'p-2' } as any);

    expect(link).toBe('/call-queue/operations/op-fallback/patient/p-2');
  });

  it('returns call queue root when operation and patient ids are missing', () => {
    const svc = makePatientCallService([]);
    const comp = new CallQueuePatientFilterComponent(svc as any, new DatePipe('en-US'));

    expect(comp.getPatientCallLink({ patientId: 'p-2' } as any)).toBe('/call-queue');
    expect(comp.getPatientCallLink({ patientOperationId: 'op-2' } as any)).toBe('/call-queue');
  });
});
