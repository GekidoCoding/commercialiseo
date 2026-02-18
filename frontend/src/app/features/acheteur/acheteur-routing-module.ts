import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAcheteur} from './pages/test-acheteur/test-acheteur';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-acheteur', component: TestAcheteur },
      { path: '', redirectTo: 'test-acheteur', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcheteurRoutingModule { }
