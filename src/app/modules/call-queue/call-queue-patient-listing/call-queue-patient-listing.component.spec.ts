import { of } from 'rxjs';
import { CallQueuePatientListingComponent } from './call-queue-patient-listing.component';

const makePatientService = (
  patients = [{ patientDischargeDate: '2020-01-02', patientNextCallScheduledTime: '2020-01-03' }]
) => ({
  getActiveSpanishPatients: jest.fn(() => of(patients as any)),
  getActivePatientListByOperationId: jest.fn(() => of(patients as any))
});

const makeStatusService = () => ({
  getPatientCallStatuses: jest.fn(() => of([]))
});

describe('CallQueuePatientListingComponent (Jest)', () => {
  it('loads spanish patients and sorts by call date ascending', async () => {
    const patientService = makePatientService([
      { patientNextCallScheduledTime: '2020-01-03' } as any,
      { patientNextCallScheduledTime: '2020-01-01' } as any
    ]);
    const statusService = makeStatusService();
    const comp = new CallQueuePatientListingComponent(patientService as any, statusService as any);
    comp.mode = { spanish: true };

    comp.ngOnInit();
    const patients$ = comp.patients$ as any;
    expect(patients$).toBeTruthy();
    await new Promise(resolve => patients$.subscribe(() => resolve(null)));

    expect(patientService.getActiveSpanishPatients).toHaveBeenCalled();
    expect(comp.spanishPatientsCount).toBe(2);
    expect(comp.patients[0].patientNextCallScheduledTime).toBe('2020-01-01');
  });

  it('loads operation patients and sorts by discharge date descending when toggled', async () => {
    const patientService = makePatientService([
      { patientDischargeDate: '2020-01-01' } as any,
      { patientDischargeDate: '2020-02-01' } as any
    ]);
    const statusService = makeStatusService();
    const comp = new CallQueuePatientListingComponent(patientService as any, statusService as any);
    comp.mode = { spanish: false };
    comp.operation = { operationId: 'op-1' } as any;
    comp.selectedSortOption = 'Discharge Date';
    comp.selectedSortFlag = 'desc';

    comp.ngOnInit();
    const patients$ = comp.patients$ as any;
    expect(patients$).toBeTruthy();
    await new Promise(resolve => patients$.subscribe(() => resolve(null)));
    comp.runSortSwitch();

    expect(patientService.getActivePatientListByOperationId).toHaveBeenCalledWith('op-1');
    expect(comp.patients[0].patientDischargeDate).toBe('2020-02-01');
  });

  it('checks date relative to today', () => {
    const patientService = makePatientService();
    const statusService = makeStatusService();
    const comp = new CallQueuePatientListingComponent(patientService as any, statusService as any);
    comp.todaysDate = new Date('2020-01-02');

    expect(comp.checkDateGreaterThanEqualToToday('2020-01-02')).toBe(true);
    expect(comp.checkDateGreaterThanEqualToToday('2020-01-03')).toBe(false);
  });
});
