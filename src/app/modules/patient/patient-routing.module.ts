import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { Shell } from '@app/shell/shell.service';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';

import { PatientResolver } from './patient-resolver.service';
import { UserResolver } from '../user/user-resolver.service';
import { PatientListingComponent } from './patient-listing/patient-listing.component';
import { PatientHistoryDetailComponent } from './patient-detail/patient-history-detail.component';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'operations/:operationId/patients',
      pathMatch: 'full',
      component: PatientListingComponent,
      resolve: {
        user: UserResolver
      },
      data: {
        title: extract('Patient Listing')
      }
    },
    {
      path: 'call-queue/operations/:operationId/patient/:patientId',
      pathMatch: 'full',
      component: PatientDetailComponent,
      resolve: {
        user: UserResolver,
        patient: PatientResolver
      },
      data: {
        title: extract('Patient Detail')
      }
    },
    {
      path: 'call-queue/operations/:operationId/patient/:patientId/history',
      pathMatch: 'full',
      component: PatientHistoryDetailComponent,
      resolve: {
        user: UserResolver,
        patient: PatientResolver
      },
      data: {
        title: extract('Patient History Listing')
      }
    },
    {
      path: 'patients',
      pathMatch: 'full',
      component: PatientListingComponent,
      resolve: {
        user: UserResolver
      },
      data: {
        title: extract('Patient Listing')
      }
    },
    {
      path: 'patient/add',
      pathMatch: 'full',
      component: PatientFormComponent,
      resolve: {
        user: UserResolver
      },
      data: {
        title: extract('New Patient')
      }
    },
    {
      path: 'patient/edit/:patientId',
      pathMatch: 'full',
      component: PatientFormComponent,
      resolve: {
        patient: PatientResolver,
        user: UserResolver
      },
      canActivate: [AuthGuardService],
      data: {
        editMode: true,
        roles: ['admin', 'manager'],
        title: extract('Edit Patient')
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [UserResolver, PatientResolver]
})
export class PatientRoutingModule {}
