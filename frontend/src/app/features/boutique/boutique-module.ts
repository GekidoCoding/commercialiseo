import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoutiqueRoutingModule } from './boutique-routing-module';
import {TestBoutique} from './pages/test-boutique/test-boutique';
import {ProductsListBoutiqueComponent} from './pages/products-list-boutique/products-list-boutique.component';
import {VariantAddFormComponent} from './components/variant-add-form/variant-add-form.component';
import {VariantUpdateFormComponent} from './components/variant-update-form/variant-update-form.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    TestBoutique,
    ProductsListBoutiqueComponent,
    VariantAddFormComponent,
    VariantUpdateFormComponent
  ],
  imports: [
    CommonModule,
    BoutiqueRoutingModule,
    FormsModule
  ]
})
export class BoutiqueModule { }
