import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogoPage } from './logo.page';

const routes: Routes = [
  {
    path: '',
    component: LogoPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogoPageRoutingModule {}
