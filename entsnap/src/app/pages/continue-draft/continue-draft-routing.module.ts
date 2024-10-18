import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContinueDraftPage } from './continue-draft.page';

const routes: Routes = [
  {
    path: '',
    component: ContinueDraftPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContinueDraftPageRoutingModule {}
