import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoutiqueRoutingModule } from './boutique-routing-module';
import {TestBoutique} from './pages/test-boutique/test-boutique';


@NgModule({
  declarations: [
    TestBoutique
  ],
  imports: [
    CommonModule,
    BoutiqueRoutingModule
  ]
})
export class BoutiqueModule { }
