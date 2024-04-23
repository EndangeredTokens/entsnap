import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InternetErrorPageRoutingModule } from './internet-error-routing.module';

import { InternetErrorPage } from './internet-error.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternetErrorPageRoutingModule
  ],
  declarations: [InternetErrorPage]
})
export class InternetErrorPageModule {}
