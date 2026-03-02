import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestBoutique} from './pages/test-boutique/test-boutique';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';
import {ProductsListBoutiqueComponent} from './pages/products-list-boutique/products-list-boutique.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-boutique', component: TestBoutique },
      { path: 'products/user', component: ProductsListBoutiqueComponent },
      { path: '', redirectTo: 'products/user', pathMatch: 'full' }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoutiqueRoutingModule { }
