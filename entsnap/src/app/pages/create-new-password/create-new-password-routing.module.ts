import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateNewPasswordPage } from './create-new-password.page';

const routes: Routes = [
  {
    path: '',
    component: CreateNewPasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateNewPasswordPageRoutingModule {}
