import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Web3SignupComponent } from './web3-signup.component';

const routes: Routes = [
  {
    path: '',
    component: Web3SignupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Web3SignupRoutingModule { }
