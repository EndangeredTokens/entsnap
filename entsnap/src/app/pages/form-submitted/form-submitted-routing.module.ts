import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormSubmittedPage } from './form-submitted.page';

const routes: Routes = [
  {
    path: '',
    component: FormSubmittedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormSubmittedPageRoutingModule {}
