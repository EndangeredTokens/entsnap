import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportMapNewPageRoutingModule } from './report-map-new-routing.module';

import { ReportMapNewPage } from './report-map-new.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportMapNewPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ReportMapNewPage]
})
export class ReportMapNewPageModule {}
