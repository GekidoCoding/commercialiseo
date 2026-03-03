import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoutiqueRoutingModule } from './boutique-routing-module';
import {TestBoutique} from './pages/test-boutique/test-boutique';
import {ProductsListBoutiqueComponent} from './pages/products-list-boutique/products-list-boutique.component';
import {VariantAddFormComponent} from './components/variant-add-form/variant-add-form.component';
import {VariantUpdateFormComponent} from './components/variant-update-form/variant-update-form.component';
import {FormsModule} from '@angular/forms';
import {PromotionAddFormComponent} from './components/promotion-add-form.component/promotion-add-form.component';
import {PromotionUpdateFormComponent} from './components/promotion-update-form/promotion-update-form.component';

@NgModule({
  declarations: [
    TestBoutique,
    ProductsListBoutiqueComponent,
    VariantAddFormComponent,
    VariantUpdateFormComponent,
    PromotionAddFormComponent,
    PromotionUpdateFormComponent
  ],
  imports: [
    CommonModule,
    BoutiqueRoutingModule,
    FormsModule
  ]
})
export class BoutiqueModule { }
