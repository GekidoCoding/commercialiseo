import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import {TestAdmin} from './pages/test-admin/test-admin';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ProduitsFormComponent} from './components/produit/produits-form/produits-form.component';
import {CategorieFormComponent} from './components/categorie/categorie-form/categorie-form.component';
import {ProduitsListComponent} from './pages/produits-list/produits-list.component';


@NgModule({
  declarations: [
    TestAdmin,
    ProduitsFormComponent,
    CategorieFormComponent,
    ProduitsListComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule ,
    CommonModule, FormsModule, RouterModule
  ]
})
export class AdminModule { }
