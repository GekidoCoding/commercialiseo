import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcheteurRoutingModule } from './acheteur-routing-module';
import {TestAcheteur} from './pages/test-acheteur/test-acheteur';
import {ProductsListAcheteurComponent} from './pages/products-list-acheteur/products-list-acheteur.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    TestAcheteur,
    ProductsListAcheteurComponent
  ],
  imports: [
    CommonModule,
    AcheteurRoutingModule,
    FormsModule
  ]
})
export class AcheteurModule { }
