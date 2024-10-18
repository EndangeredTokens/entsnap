import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpecificEntPageRoutingModule } from './specific-ent-routing.module';

import { SpecificEntPage } from './specific-ent.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpecificEntPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [SpecificEntPage]
})
export class SpecificEntPageModule {}
