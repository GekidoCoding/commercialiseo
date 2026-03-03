import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAcheteur} from './pages/test-acheteur/test-acheteur';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';
import {ProductsListAcheteurComponent} from './pages/products-list-acheteur/products-list-acheteur.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-acheteur', component: TestAcheteur },
      { path: 'products/recommanded', component: ProductsListAcheteurComponent },
      { path: '', redirectTo: 'products/recommanded', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcheteurRoutingModule { }
