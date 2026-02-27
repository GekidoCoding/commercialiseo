import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAdmin} from './pages/test-admin/test-admin';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';
import {ProduitsListComponent} from './pages/produits-list/produits-list.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-admin', component: TestAdmin },
      { path: 'produits/list', component: ProduitsListComponent },
      { path: '', redirectTo: 'produits/list', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
