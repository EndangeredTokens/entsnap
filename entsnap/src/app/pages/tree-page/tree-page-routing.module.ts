import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreePagePage } from './tree-page.page';

const routes: Routes = [
  {
    path: '',
    component: TreePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreePagePageRoutingModule {}
