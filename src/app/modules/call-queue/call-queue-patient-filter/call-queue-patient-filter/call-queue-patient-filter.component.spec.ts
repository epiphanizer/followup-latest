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
});
