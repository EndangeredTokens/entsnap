import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternetErrorPage } from './internet-error.page';

const routes: Routes = [
  {
    path: '',
    component: InternetErrorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternetErrorPageRoutingModule {}
