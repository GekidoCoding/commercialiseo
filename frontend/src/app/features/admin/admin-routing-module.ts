import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAdmin} from './pages/test-admin/test-admin';

const routes: Routes = [
  { path: '', component: TestAdmin },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
