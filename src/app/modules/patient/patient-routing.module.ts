import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PatientAddComponent } from './patient-add/patient-add.component';
import { PatientEditComponent } from './patient-edit/patient-edit.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'patient/add',
      component: PatientAddComponent,
      data: {
        title: extract('New Patient')
      }
    },
    {
      path: 'patient/edit',
      component: PatientEditComponent,
      data: {
        title: extract('Edit Patient')
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
