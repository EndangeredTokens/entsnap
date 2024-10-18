import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginPageRoutingModule } from './login-test-routing.module';

import { LoginPage } from './login-test.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LoginPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
