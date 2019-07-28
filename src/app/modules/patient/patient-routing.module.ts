import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientAddComponent } from './patient-add/patient-add.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: 'patient', redirectTo: '/call-queue', pathMatch: 'full' },
    {
      path: 'patient/add',
      component: PatientAddComponent,
      data: {
        title: extract('New Patient')
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PatientRoutingModule {}
