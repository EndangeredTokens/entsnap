import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllReportsPage } from './all-reports.page';

const routes: Routes = [
  {
    path: '',
    component: AllReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllReportsPageRoutingModule {}
