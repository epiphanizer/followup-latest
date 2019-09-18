import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { Shell } from '@app/shell/shell.service';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientResolver } from './patient-resolver.service';
import { UserResolver } from '../user/user-resolver.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'call-queue/operations/:operationId/patient/:patientId',
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
        title: extract('Patient Detail'),
        operation: ':operationId'
      }
    },
    {
      path: 'patient/add',
      component: PatientFormComponent,
      resolve: {
        user: UserResolver
      },
      data: {
        navLinks: [
          { linkAction: 'call-queue', linkName: 'Call Queue', linkType: 'link' },
          { linkAction: 'kudos', linkName: 'KUDOS', linkType: 'button' },
          { linkAction: 'report', linkName: 'REPORT!', linkType: 'button' }
        ],
        title: extract('New Patient')
      }
    },
    {
      path: 'patient/edit/:patientId',
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
  providers: [PatientResolver]
})
export class PatientRoutingModule {}
