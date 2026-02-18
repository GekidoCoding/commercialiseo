import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAcheteur} from './pages/test-acheteur/test-acheteur';

const routes: Routes = [
  { path: '', component: TestAcheteur },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcheteurRoutingModule { }
