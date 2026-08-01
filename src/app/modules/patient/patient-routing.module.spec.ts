import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientResolver } from './patient-resolver.service';
import { patientRoutes } from './patient-routing.module';
import { UserResolver } from '../user/user-resolver.service';

describe('patientRoutes', () => {
  it('includes the archived patient history route', () => {
    const shellRoute = patientRoutes[0];
    const historyRoute = shellRoute.children?.find(
      route => route.path === 'call-queue/operations/:operationId/patient/:patientId/history'
    );

    expect(historyRoute).toBeTruthy();
    expect(historyRoute?.component).toBe(PatientDetailComponent);
    expect(historyRoute?.resolve).toEqual(
      expect.objectContaining({
        user: UserResolver,
        patient: PatientResolver
      })
    );
    expect(historyRoute?.data).toEqual(
      expect.objectContaining({
        followupReadOnly: true
      })
    );
  });
});