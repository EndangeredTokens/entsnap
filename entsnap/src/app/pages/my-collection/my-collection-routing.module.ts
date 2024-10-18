import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyCollectionPage } from './my-collection.page';

const routes: Routes = [
  {
    path: '',
    component: MyCollectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyCollectionPageRoutingModule {}
