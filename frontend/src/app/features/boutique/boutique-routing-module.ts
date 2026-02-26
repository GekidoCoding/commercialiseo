import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestBoutique} from './pages/test-boutique/test-boutique';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';
import {TestAcheteur} from '../acheteur/pages/test-acheteur/test-acheteur';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-boutique', component: TestBoutique },
      { path: '', redirectTo: 'test-boutique', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoutiqueRoutingModule { }
