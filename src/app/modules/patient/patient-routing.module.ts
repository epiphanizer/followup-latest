import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { Shell } from '@app/shell/shell.service';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';

import { PatientResolver } from './patient-resolver.service';
import { UserResolver } from '../user/user-resolver.service';
import { PatientListingComponent } from './patient-listing/patient-listing.component';
import { AuthGuardService } from '@app/core/authentication/auth-guard.service';
import { UserRoles } from '../user/user';

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
      path: 'patients/add',
      pathMatch: 'full',
      component: PatientFormComponent,
      canActivate: [AuthGuardService],
      resolve: {
        user: UserResolver
      },
      data: {
        roles: [UserRoles.admin, UserRoles.manager],
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
        roles: [UserRoles.admin, UserRoles.manager],
        title: extract('Edit Patient')
      }
    }
  ])
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
    // NgxMaskModule.forRoot()
  ],
  exports: [RouterModule],
  providers: [UserResolver, PatientResolver]
})
export class PatientRoutingModule {}
