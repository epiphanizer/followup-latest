import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { Shell } from '@app/shell/shell.service';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';

import { PatientResolver } from './patient-resolver.service';
import { UserResolver } from '../user/user-resolver.service';
import { PatientListingComponent } from './patient-listing/patient-listing.component';

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
        navLinks: [{ linkAction: 'patient/add', linkName: 'Add Patient', linkType: 'link' }],
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
        navLinks: [
          { linkAction: 'call-queue', linkName: 'Call Queue', linkType: 'link' },
          { linkAction: 'kudos', linkName: 'KUDOS', linkType: 'button' },
          { linkAction: 'report', linkName: 'REPORT!', linkType: 'button' }
        ],
        title: extract('Patient Detail')
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
        navLinks: [
          { linkAction: 'patient/add', linkName: 'Add Patient', linkType: 'link' },
          { linkAction: 'notifications', linkName: 'Notifications', linkType: 'link' }
          // { linkAction: 'patient/previous', linkName: 'Previous Discharge', linkType: 'link' },
        ],
        title: extract('New Patient')
      }
    },
    {
      path: 'patient/edit/:patientId',
      pathMatch: 'full',
      component: PatientFormComponent,
      resolve: {
        user: UserResolver,
        patient: PatientResolver
      },
      data: {
        editMode: true,
        navLinks: [
          { linkAction: 'call-queue', linkName: 'Call Queue', linkType: 'link' },
          { linkAction: 'kudos', linkName: 'KUDOS', linkType: 'button' },
          { linkAction: 'report', linkName: 'REPORT!', linkType: 'button' }
        ],
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
