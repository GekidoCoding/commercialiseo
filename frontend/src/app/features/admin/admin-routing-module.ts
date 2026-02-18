import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestAdmin} from './pages/test-admin/test-admin';
import {ModuleLayoutComponent} from '../../shared/components/module-layout/module-layout.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: 'test-admin', component: TestAdmin },
      { path: '', redirectTo: 'test-admin', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
