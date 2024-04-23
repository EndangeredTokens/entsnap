import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpecificEntPage } from './specific-ent.page';

const routes: Routes = [
  {
    path: '',
    component: SpecificEntPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecificEntPageRoutingModule {}
