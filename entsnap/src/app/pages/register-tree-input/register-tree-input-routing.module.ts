import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterTreeInputPage } from './register-tree-input.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterTreeInputPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterTreeInputPageRoutingModule {}
