import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestPasswordResetPageRoutingModule } from './request-password-reset-routing.module';

import { RequestPasswordResetPage } from './request-password-reset.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestPasswordResetPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [RequestPasswordResetPage],
})
export class RequestPasswordResetPageModule {}
