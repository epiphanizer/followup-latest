import { of } from 'rxjs';
import { CallQueuePatientListingComponent } from './call-queue-patient-listing.component';

const makePatientService = (
  patients = [{ patientDischargeDate: '2020-01-02', patientNextCallScheduledTime: '2020-01-03' }]
) => ({
  getActiveSpanishPatients: jest.fn(() => of(patients as any)),
  getActivePatientListByOperationId: jest.fn(() => of(patients as any))
});

describe('CallQueuePatientListingComponent (Jest)', () => {
  it('loads spanish patients and sorts by call date ascending', async () => {
    const patientService = makePatientService([
      { patientNextCallScheduledTime: '2020-01-03' } as any,
      { patientNextCallScheduledTime: '2020-01-01' } as any
    ]);
    const comp = new CallQueuePatientListingComponent(patientService as any);
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
    const comp = new CallQueuePatientListingComponent(patientService as any);
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
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.todaysDate = new Date('2020-01-02');

    expect(comp.checkDateGreaterThanEqualToToday('2020-01-02')).toBe(true);
    expect(comp.checkDateGreaterThanEqualToToday('2020-01-03')).toBe(false);
  });

  it('reloads patients when operation changes', async () => {
    const patients = [{ patientNextCallScheduledTime: '2020-01-10' }] as any;
    const patientService = makePatientService(patients);
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.operation = { operationId: 'old' } as any;
    comp.runSortSwitch = jest.fn();

    comp.ngOnChanges({
      operation: {
        currentValue: { operationId: 'new-op' },
        previousValue: { operationId: 'old' },
        firstChange: false,
        isFirstChange: () => false
      }
    } as any);
    const patients$ = comp.patients$ as any;
    await new Promise(resolve => patients$.subscribe(() => resolve(null)));

    expect(patientService.getActivePatientListByOperationId).toHaveBeenCalledWith('new-op');
    expect(comp.patients).toEqual(patients);
    expect(comp.runSortSwitch).toHaveBeenCalled();
  });

  it('toggles sort flag and reruns sorting', () => {
    const patientService = makePatientService();
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.runSortSwitch = jest.fn();

    comp.toggleAscDesc('desc');

    expect(comp.selectedSortFlag).toBe('desc');
    expect(comp.runSortSwitch).toHaveBeenCalled();
  });

  it('changes sort option and reruns sorting', () => {
    const patientService = makePatientService();
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.runSortSwitch = jest.fn();

    comp.sortOptionSelected('Discharge Date');

    expect(comp.selectedSortOption).toBe('Discharge Date');
    expect(comp.runSortSwitch).toHaveBeenCalled();
  });

  it('sorts patients by call date', () => {
    const patientService = makePatientService();
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.patients = [
      { patientNextCallScheduledTime: '2020-02-01' },
      { patientNextCallScheduledTime: '2020-01-01' }
    ] as any;

    comp.selectedSortFlag = 'asc';
    comp.sortPatientsByCallDate();
    expect(comp.patients[0].patientNextCallScheduledTime).toBe('2020-01-01');

    comp.selectedSortFlag = 'desc';
    comp.sortPatientsByCallDate();
    expect(comp.patients[0].patientNextCallScheduledTime).toBe('2020-02-01');
  });

  it('sorts patients by discharge date', () => {
    const patientService = makePatientService();
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.patients = [
      { patientDischargeDate: '2020-01-01' },
      { patientDischargeDate: '2020-03-01' },
      { patientDischargeDate: '2020-02-01' }
    ] as any;

    comp.selectedSortFlag = 'asc';
    comp.sortPatientsByDischargeDate();
    expect(comp.patients[0].patientDischargeDate).toBe('2020-01-01');

    comp.selectedSortFlag = 'desc';
    comp.sortPatientsByDischargeDate();
    expect(comp.patients[0].patientDischargeDate).toBe('2020-03-01');
  });

  it('falls back to selected operation id when patient operation id is missing', () => {
    const patientService = makePatientService();
    const comp = new CallQueuePatientListingComponent(patientService as any);
    comp.operation = { operationId: 'op-fallback' } as any;

    const link = comp.getPatientLink({ patientId: 'p-1' } as any);

    expect(link).toBe('/call-queue/operations/op-fallback/patient/p-1');
  });

  it('returns call queue root when operation or patient id is unavailable', () => {
    const patientService = makePatientService();
    const comp = new CallQueuePatientListingComponent(patientService as any);

    expect(comp.getPatientLink({ patientId: 'p-1' } as any)).toBe('/call-queue');
    expect(comp.getPatientLink({ patientOperationId: 'op-1' } as any)).toBe('/call-queue');
  });
});
