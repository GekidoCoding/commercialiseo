import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import {TestAdmin} from './pages/test-admin/test-admin';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CategorieFormComponent} from './components/categorie/categorie-form/categorie-form.component';
import {ProduitsListComponent} from './pages/produits-list/produits-list.component';
import {ProduitsAddFormComponent} from './components/produit/produits-add-form/produits-add-form.component';

@NgModule({
  declarations: [
    TestAdmin,
    ProduitsAddFormComponent,
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
