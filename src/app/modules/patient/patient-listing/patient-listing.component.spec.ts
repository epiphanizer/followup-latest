import { PatientListingComponent } from './patient-listing.component';
import { of } from 'rxjs';

const makeRoute = (mode?: 'spanish', operationId?: string, userOverride?: any) => {
  const user =
    userOverride ||
    ({
      operationGroups: [
        {
          operations: [{ operationId: 'op-1', name: 'op1' }]
        }
      ]
    } as any);
  return {
    snapshot: {
      data: { user, mode },
      paramMap: {
        get: jest.fn(() => operationId || null)
      }
    }
  } as any;
};

const makeServices = () => {
  const patientService = {
    getPatientsByOperationId: jest.fn(() => of([{ id: 'p1' }] as any))
  } as any;
  const operationService = {
    getOperationByOperationId: jest.fn(() => of([{ operationId: 'op-2', name: 'op2' }] as any))
  } as any;
  return { patientService, operationService };
};

const makeIonContent = () => {
  const scrollEl = { style: {} as any };
  return {
    scrollEl,
    getScrollElement: jest.fn(() => Promise.resolve(scrollEl))
  };
};

describe('PatientListingComponent (Jest)', () => {
  it('sets selected operation from route user when no operationId and not spanish', () => {
    const route = makeRoute();
    const { patientService, operationService } = makeServices();
    const cdr = { detectChanges: jest.fn() } as any;
    const comp = new PatientListingComponent(cdr, patientService, operationService, route, {
      onPopState: jest.fn()
    } as any);

    comp.ngOnInit();

    expect(comp.selected.operation.operationId).toBe('op-1');
    expect(comp.mode.spanish).toBe(false);
  });

  it('sets spanish mode when route mode is spanish', () => {
    const route = makeRoute('spanish');
    const { patientService, operationService } = makeServices();
    const cdr = { detectChanges: jest.fn() } as any;
    const comp = new PatientListingComponent(cdr, patientService, operationService, route, {
      onPopState: jest.fn()
    } as any);

    comp.ngOnInit();

    expect(comp.mode.spanish).toBe(true);
  });

  it('loads operation from service when operationId is provided', () => {
    const route = makeRoute(undefined, 'op-99');
    const { patientService, operationService } = makeServices();
    const cdr = { detectChanges: jest.fn() } as any;
    const comp = new PatientListingComponent(cdr, patientService, operationService, route, {
      onPopState: jest.fn()
    } as any);

    comp.ngOnInit();

    expect(operationService.getOperationByOperationId).toHaveBeenCalledWith('op-99');
  });

  it('handles operation change by fetching patients and updating selection', done => {
    const route = makeRoute();
    const { patientService, operationService } = makeServices();
    const cdr = { detectChanges: jest.fn() } as any;
    const comp = new PatientListingComponent(cdr, patientService, operationService, route, {
      onPopState: jest.fn()
    } as any);
    const op = { operationId: 'op-3' } as any;

    comp.operationChangeEventHandler(op);

    expect(comp.selected.operation).toBe(op);
    expect(patientService.getPatientsByOperationId).toHaveBeenCalledWith('op-3');

    expect(comp.patients$).not.toBeNull();

    comp.patients$!.subscribe({
      next: (patients: any) => {
        expect(patients).toEqual([{ id: 'p1' }]);
        expect(comp.patients).toEqual([{ id: 'p1' }]);
        expect(cdr.detectChanges).toHaveBeenCalled();
        done();
      },
      error: (err: any) => done.fail(err)
    });
  });

  it('sets scroll styles when IonContent is present', async () => {
    const route = makeRoute();
    const { patientService, operationService } = makeServices();
    const cdr = { detectChanges: jest.fn() } as any;
    const comp = new PatientListingComponent(cdr, patientService, operationService, route, {
      onPopState: jest.fn()
    } as any);
    const content = makeIonContent();
    comp.content = content as any;

    await comp.ngAfterViewInit();

    const style = (await (content as any).getScrollElement()).style as any;
    expect(style.overflow).toBe('auto');
    expect(style.overflowY).toBe('scroll');
    expect(style.height).toBe('100%');
  });

  it('clears patients on destroy', () => {
    const route = makeRoute();
    const { patientService, operationService } = makeServices();
    const cdr = { detectChanges: jest.fn() } as any;
    const comp = new PatientListingComponent(cdr, patientService, operationService, route, {
      onPopState: jest.fn()
    } as any);
    comp.patients = [{ id: 'p1' } as any];

    comp.ngOnDestroy();

    expect(comp.patients).toBeNull();
  });
});
