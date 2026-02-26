import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAdmin} from './pages/test-admin/test-admin';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';
import {ProduitsFormComponent} from './components/produit/produits-form/produits-form.component';
import {CategorieFormComponent} from './components/categorie/categorie-form/categorie-form.component';
import {ProduitsListComponent} from './pages/produits-list/produits-list.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-admin', component: TestAdmin },
      { path: 'admin/produit/form', component: ProduitsFormComponent },
      { path: 'admin/produits/list', component: ProduitsListComponent },

      { path: '', redirectTo: 'admin/produit/form', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
