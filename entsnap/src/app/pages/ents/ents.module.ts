import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EntsPageRoutingModule } from './ents-routing.module';

import { EntsPage } from './ents.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EntsPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EntsPage]
})
export class EntsPageModule {}
