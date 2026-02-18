import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import {TestAdmin} from './pages/test-admin/test-admin';


@NgModule({
  declarations: [
    TestAdmin,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
