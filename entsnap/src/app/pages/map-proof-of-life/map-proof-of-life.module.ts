import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-proof-of-life-routing.module';

import { MapPage } from './map-proof-of-life.page';
import { ComponentsModule } from '../../components/components.module';
// import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    ComponentsModule,
    // AgmCoreModule
  ],
  declarations: [MapPage]
})
export class MapPageModule {}
