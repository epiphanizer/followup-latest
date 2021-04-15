import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { DataResolver } from './data-resolver.service';
import { UserRoles } from '../user/user';

const routes: Routes = [
  Shell.childRoutes([
    {
      canActivate: [UserRoles.admin],
      path: 'data',
      resolve: {
        data: DataResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DataResolver]
})
export class DataRoutingModule {}
