import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import {TestAdmin} from './pages/test-admin/test-admin';
import {ProduitsComponent} from './pages/produits/produits.component';


@NgModule({
  declarations: [
    TestAdmin,
    ProduitsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
