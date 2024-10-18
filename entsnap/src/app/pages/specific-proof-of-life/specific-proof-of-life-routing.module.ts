import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpecificProofOfLifePage } from './specific-proof-of-life.page';

const routes: Routes = [
  {
    path: '',
    component: SpecificProofOfLifePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecificProofOfLifePageRoutingModule {}
