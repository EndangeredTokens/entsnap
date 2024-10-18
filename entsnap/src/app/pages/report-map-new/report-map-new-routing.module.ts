import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportMapNewPage } from './report-map-new.page';

const routes: Routes = [
  {
    path: '',
    component: ReportMapNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportMapNewPageRoutingModule {}
