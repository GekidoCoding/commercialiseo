import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcheteurRoutingModule } from './acheteur-routing-module';
import {TestAcheteur} from './pages/test-acheteur/test-acheteur';


@NgModule({
  declarations: [
    TestAcheteur
  ],
  imports: [
    CommonModule,
    AcheteurRoutingModule
  ]
})
export class AcheteurModule { }
