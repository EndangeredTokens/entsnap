import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LogoPage } from './logo.page';

import { LogoPageRoutingModule } from './logo-routing.module';
import { ComponentsModule } from '../../components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [LogoPage]
})
export class LogoPageModule {}
