import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormSubmittedPageRoutingModule } from './form-submitted-routing.module';

import { FormSubmittedPage } from './form-submitted.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormSubmittedPageRoutingModule
  ],
  declarations: [FormSubmittedPage]
})
export class FormSubmittedPageModule {}
