import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestBoutique} from './pages/test-boutique/test-boutique';

const routes: Routes = [
  { path: '', component: TestBoutique },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoutiqueRoutingModule { }
