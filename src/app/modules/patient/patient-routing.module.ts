import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientAddComponent } from './patient-add/patient-add.component';
import { PatientEditComponent } from './patient-edit/patient-edit.component';
import { Shell } from '@app/shell/shell.service';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientResolver } from './patient-resolver.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'call-queue/operations/:operationId/patient/:patientId',
      component: PatientDetailComponent,
      resolve: {
        patient: PatientResolver
      },
      data: {
        title: extract('Patient Detail')
      }
    },
    {
      path: 'patient/add',
      component: PatientAddComponent,
      data: {
        title: extract('New Patient')
      }
    },
    {
      path: 'patient/edit/:patientId',
      component: PatientEditComponent,
      resolve: {
        patient: PatientResolver
      },
      data: {
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
