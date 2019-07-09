import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { CallQueueComponent } from './call-queue.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/call-queue', pathMatch: 'full' },
    { path: 'call-queue', component: CallQueueComponent, data: { title: extract('Call Queue') } }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CallQueueRoutingModule {}
